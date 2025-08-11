import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const host = req.headers.get("host") || ""
  const authUrlSet = !!(process.env.AUTH_URL || process.env.NEXTAUTH_URL)
  const googleSet = !!process.env.GOOGLE_CLIENT_ID
  return NextResponse.json({ host, authUrl: authUrlSet ? "set" : "missing", google: googleSet }, { status: 200 })
} 