import { prisma } from './prisma'
import crypto from 'crypto'

// Environment variables
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

interface ZoomTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface ZoomIntegrationData {
  userId: string
  zoomAccountId: string
  accessToken: string
  refreshToken?: string
  expiresAt: Date
}

// Encryption utilities
const encrypt = (text: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Rate limiting utility
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 80 // Conservative limit (Zoom allows 100/minute)
  private readonly windowMs = 60000 // 1 minute

  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    await this.waitIfNeeded()
    this.requests.push(Date.now())
    return await requestFn()
  }

  private async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Remove old requests outside window
    this.requests = this.requests.filter(time => time > windowStart)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = oldestRequest + this.windowMs - now
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
}

const rateLimiter = new RateLimiter()

// Get access token using Server-to-Server OAuth
export const getZoomAccessToken = async (): Promise<string> => {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    throw new Error('Missing Zoom OAuth credentials')
  }

  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')

  return await rateLimiter.makeRequest(async () => {
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Zoom access token: ${response.status} - ${error}`)
    }

    const data: ZoomTokenResponse = await response.json()
    return data.access_token
  })
}

// Store Zoom integration for a user
export const storeZoomIntegration = async (data: ZoomIntegrationData) => {
  const encryptedAccessToken = encrypt(data.accessToken)
  const encryptedRefreshToken = data.refreshToken ? encrypt(data.refreshToken) : null

  return await prisma.zoomIntegration.upsert({
    where: {
      userId_zoomAccountId: {
        userId: data.userId,
        zoomAccountId: data.zoomAccountId
      }
    },
    update: {
      accessTokenEncrypted: encryptedAccessToken,
      refreshTokenEncrypted: encryptedRefreshToken,
      tokenExpiresAt: data.expiresAt,
      lastSyncAt: new Date()
    },
    create: {
      userId: data.userId,
      zoomAccountId: data.zoomAccountId,
      accessTokenEncrypted: encryptedAccessToken,
      refreshTokenEncrypted: encryptedRefreshToken,
      tokenExpiresAt: data.expiresAt,
      webhookVerificationToken: crypto.randomBytes(32).toString('hex')
    }
  })
}

// Get Zoom integration for a user
export const getZoomIntegration = async (userId: string, zoomAccountId?: string) => {
  const where = zoomAccountId 
    ? { userId_zoomAccountId: { userId, zoomAccountId } }
    : { userId }

  const integration = await prisma.zoomIntegration.findFirst({
    where
  })

  if (!integration) {
    return null
  }

  return {
    ...integration,
    accessToken: decrypt(integration.accessTokenEncrypted),
    refreshToken: integration.refreshTokenEncrypted ? decrypt(integration.refreshTokenEncrypted) : null
  }
}

// Check if access token is valid or needs refresh
export const isTokenValid = (integration: any): boolean => {
  if (!integration.tokenExpiresAt) return false
  
  // Consider token expired if it expires within 5 minutes
  const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
  return new Date().getTime() < (integration.tokenExpiresAt.getTime() - bufferTime)
}

// Get valid access token (refresh if needed)
export const getValidAccessToken = async (userId: string): Promise<string> => {
  const integration = await getZoomIntegration(userId)
  
  if (!integration) {
    throw new Error('No Zoom integration found for user')
  }

  if (isTokenValid(integration)) {
    return integration.accessToken
  }

  // Token expired, get new one using Server-to-Server OAuth
  const newAccessToken = await getZoomAccessToken()
  
  // Update stored token
  await storeZoomIntegration({
    userId,
    zoomAccountId: integration.zoomAccountId,
    accessToken: newAccessToken,
    refreshToken: integration.refreshToken,
    expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
  })

  return newAccessToken
}

// Make authenticated request to Zoom API
export const makeZoomApiRequest = async (
  userId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = await getValidAccessToken(userId)

  return await rateLimiter.makeRequest(async () => {
    const response = await fetch(`https://api.zoom.us/v2${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Zoom API request failed: ${response.status} - ${error}`)
    }

    return response
  })
}

// Verify webhook signature (for security)
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  verificationToken: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', verificationToken)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Error handling utilities
export const isRetryableError = (error: Error): boolean => {
  const retryableErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'Rate limit exceeded',
    'Temporary server error',
    'Service temporarily unavailable'
  ]

  return retryableErrors.some(retryable => 
    error.message.toLowerCase().includes(retryable.toLowerCase())
  )
}

export const handleZoomError = async (error: Error, context: any) => {
  console.error('Zoom integration error:', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })

  // Log to database for monitoring
  try {
    await prisma.processingQueue.create({
      data: {
        jobType: 'error_log',
        jobData: {
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString()
        },
        status: 'completed' // Mark as completed since it's just logging
      }
    })
  } catch (logError) {
    console.error('Failed to log error to database:', logError)
  }
} 