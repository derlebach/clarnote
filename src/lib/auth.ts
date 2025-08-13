import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// Resolve envs (v5-style with fallback to v4 names)
const AUTH_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
const AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST === "true"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const isProd = process.env.NODE_ENV === "production"

// Canonical base URL (comes from Vercel env)
const baseUrl = AUTH_URL?.replace(/\/+$/, "") || "http://localhost:3001"

// If you want to allow both www and apex, keep both in ALLOWED_HOSTS
const ALLOWED_HOSTS = new Set([
  "www.clarnote.com",
  "clarnote.com", 
  "staging.clarnote.com",
  "localhost",
  "localhost:3001",
])

// One-time sanity log on boot (server only)
if (typeof window === "undefined") {
  // Keep logs concise in production
  console.log("[auth:init]", {
    authUrl: !!AUTH_URL,
    authSecret: !!AUTH_SECRET,
    google: !!GOOGLE_CLIENT_ID,
    trustHost: AUTH_TRUST_HOST,
    nodeEnv: process.env.NODE_ENV,
  })
}

// Validate required environment variables at runtime when code paths execute
function validateAuthEnvironment() {
  const missing: string[] = []
  if (!AUTH_SECRET) missing.push("AUTH_SECRET/NEXTAUTH_SECRET")
  if (!AUTH_URL) missing.push("AUTH_URL/NEXTAUTH_URL")
  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.error("Missing required environment variables:", missing.join(", "))
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Build providers
const providers: any[] = []

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
      allowDangerousEmailAccountLinking: true,
    })
  )
} else {
  console.warn("[auth:init] Google credentials missing; Google provider disabled")
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      validateAuthEnvironment()
      if (!credentials?.email || !credentials?.password) return null
      
      try {
        // Emergency: Use Supabase REST API directly (bypass Prisma)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("Missing Supabase credentials for emergency auth")
          return null
        }

        console.log("[emergency-auth] Attempting login for:", credentials.email)

        // Fetch user from Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/User?email=eq.${credentials.email}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })

        console.log("[emergency-auth] Supabase response status:", response.status)

        if (!response.ok) {
          console.error("Failed to fetch user from Supabase:", response.status)
          return null
        }

        const users = await response.json()
        console.log("[emergency-auth] Found users:", users.length)
        
        const user = users[0]
        
        if (!user || !user.password) {
          console.log("[emergency-auth] No user found or no password")
          return null
        }

        console.log("[emergency-auth] User found, verifying password...")

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log("[emergency-auth] Password valid:", isPasswordValid)
        
        if (!isPasswordValid) {
          return null
        }

        console.log("[emergency-auth] Login successful for:", user.email)

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          image: user.image 
        }
      } catch (error) {
        console.error("Emergency auth error:", error)
        return null
      }
    },
  })
)

export const authOptions: NextAuthOptions = {
  // Emergency: Disable Prisma adapter to avoid connection issues
  // adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: AUTH_SECRET || "fallback-secret-for-build",
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  providers,
  // Make cookies secure in production and scoped to the parent domain
  cookies: isProd
    ? {
        sessionToken: {
          name: "__Secure-next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
            domain: ".clarnote.com", // works for www and apex
          },
        },
      }
    : undefined,
  callbacks: {
    async jwt({ token, user, account }) {
      validateAuthEnvironment()
      if (user) {
        token.id = (user as any).id
        token.email = (user as any).email
      }
      if (account) {
        ;(token as any).accessToken = (account as any).access_token
        ;(token as any).provider = (account as any).provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token.sub as string) || ((token as any).id as string)
        ;(session.user as any).email = (token as any).email as string
      }
      return session
    },
    // Avoid open redirects; force final destination to our own hosts
    async redirect({ url, baseUrl: _ }) {
      try {
        const u = new URL(url, baseUrl)
        if (ALLOWED_HOSTS.has(u.host)) return u.toString()
      } catch (_) {}
      return baseUrl // default safe fallback
    },
  },
  debug: process.env.NODE_ENV === "development",
  // Note: trustHost is handled via AUTH_TRUST_HOST env var in NextAuth v4
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
} 