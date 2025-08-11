import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || ""
  if (host === "clarnote.com") {
    const url = new URL(req.nextUrl)
    url.host = "www.clarnote.com"
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/|api/_health|favicon.ico|manifest.json).*)"],
} 