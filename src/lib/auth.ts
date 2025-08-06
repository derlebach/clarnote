import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}

const optionalEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}

// Check if required env vars are present
const missingRequired = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingRequired.length > 0) {
  console.error('Missing required environment variables:', missingRequired.join(', '))
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`)
  }
}

// Build providers array
const providers = []

// Add Google provider only if credentials are available
if (optionalEnvVars.GOOGLE_CLIENT_ID && optionalEnvVars.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: optionalEnvVars.GOOGLE_CLIENT_ID,
      clientSecret: optionalEnvVars.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      allowDangerousEmailAccountLinking: true,
    })
  )
} else {
  console.warn('Google OAuth credentials not found. Google authentication will be disabled.')
}

// Always add credentials provider
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing email or password")
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      } catch (error) {
        console.error("Auth error:", error)
        return null
      }
    }
  })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: requiredEnvVars.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || (token.id as string)
        session.user.email = token.email as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === "google") {
        return true
      }
      
      // Allow credentials sign-ins
      if (account?.provider === "credentials") {
        return true
      }
      
      return false
    },
    async redirect({ url, baseUrl }) {
      // Handle mobile app redirects
      if (url.startsWith("capacitor://")) {
        return url
      }
      
      // Always redirect to localhost:3001 in development
      if (process.env.NODE_ENV === 'development') {
        const devBaseUrl = 'http://localhost:3001'
        if (url.startsWith('/')) return `${devBaseUrl}${url}`
        if (url.includes('localhost:3001')) return url
        return devBaseUrl
      }
      
      // Production redirect logic
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      
      // Allow redirects to the same domain
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url
        }
      } catch {
        // Invalid URL, redirect to base
      }
      
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
} 