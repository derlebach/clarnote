import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storeZoomIntegration, getZoomAccessToken } from '@/lib/zoom-auth'
import { importHistoricalRecordings, getAvailableRecordingsDateRange } from '@/lib/zoom-historical-import'

// Setup Zoom integration for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { autoImport = true, importHistorical = false, dateRange = 'last_30_days' } = body

    // Get Zoom account ID (this would come from OAuth in a real implementation)
    const zoomAccountId = process.env.ZOOM_ACCOUNT_ID || 'default-account'
    
    // Get access token
    const accessToken = await getZoomAccessToken()
    const expiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour from now

    // Store integration
    const integration = await storeZoomIntegration({
      userId: user.id,
      zoomAccountId,
      accessToken,
      expiresAt
    })

    // Update auto-import setting
    await prisma.zoomIntegration.update({
      where: { id: integration.id },
      data: { autoImportEnabled: autoImport }
    })

    let importJobId = null

    // Start historical import if requested
    if (importHistorical) {
      const dateRanges = {
        'last_7_days': 7,
        'last_30_days': 30,
        'last_90_days': 90,
        'last_180_days': 180
      }

      const days = dateRanges[dateRange as keyof typeof dateRanges] || 30
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)
      const toDate = new Date()

      // Start import in background
      importJobId = `import_${user.id}_${Date.now()}`
      
      // Queue the import job
      await prisma.processingQueue.create({
        data: {
          jobType: 'zoom_historical_import',
          jobData: {
            userId: user.id,
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: toDate.toISOString().split('T')[0],
            importJobId
          },
          priority: 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        autoImportEnabled: autoImport,
        lastSyncAt: integration.lastSyncAt
      },
      importJobId
    })

  } catch (error) {
    console.error('Zoom setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup Zoom integration' },
      { status: 500 }
    )
  }
}

// Get Zoom integration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        zoomIntegrations: true,
        zoomRecordings: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const integration = user.zoomIntegrations[0] // Get first integration

    if (!integration) {
      return NextResponse.json({
        connected: false,
        availableRecordings: await getAvailableRecordingsDateRange(user.id).catch(() => ({ count: 0, earliest: null, latest: null }))
      })
    }

    // Get recording statistics
    const recordingStats = await prisma.zoomRecording.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true
    })

    const stats = recordingStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      connected: true,
      integration: {
        id: integration.id,
        autoImportEnabled: integration.autoImportEnabled,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt
      },
      recordings: {
        recent: user.zoomRecordings,
        stats
      }
    })

  } catch (error) {
    console.error('Zoom status error:', error)
    return NextResponse.json(
      { error: 'Failed to get Zoom integration status' },
      { status: 500 }
    )
  }
}

// Update Zoom integration settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { zoomIntegrations: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const integration = user.zoomIntegrations[0]
    if (!integration) {
      return NextResponse.json({ error: 'No Zoom integration found' }, { status: 404 })
    }

    const body = await request.json()
    const { autoImportEnabled } = body

    const updatedIntegration = await prisma.zoomIntegration.update({
      where: { id: integration.id },
      data: { autoImportEnabled }
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: updatedIntegration.id,
        autoImportEnabled: updatedIntegration.autoImportEnabled,
        lastSyncAt: updatedIntegration.lastSyncAt
      }
    })

  } catch (error) {
    console.error('Zoom update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Zoom integration' },
      { status: 500 }
    )
  }
}

// Disconnect Zoom integration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { zoomIntegrations: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const integration = user.zoomIntegrations[0]
    if (!integration) {
      return NextResponse.json({ error: 'No Zoom integration found' }, { status: 404 })
    }

    // Delete the integration (this will cascade to recordings due to foreign key)
    await prisma.zoomIntegration.delete({
      where: { id: integration.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Zoom disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Zoom integration' },
      { status: 500 }
    )
  }
} 