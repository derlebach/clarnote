/**
 * API Utilities
 * Provides consistent error handling and response formatting for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      );
    }
    
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : error.message;
      
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export function successResponse<T = any>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export function validateRequest(
  required: string[],
  data: any
): void {
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'MISSING_FIELDS'
    );
  }
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    
    if (result instanceof NextResponse) {
      return result;
    }
    
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function rateLimitKey(identifier: string, window: string = 'minute'): string {
  const now = new Date();
  const timeWindow = window === 'minute' 
    ? `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
    : `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    
  return `rate_limit:${identifier}:${timeWindow}`;
}

// Simple in-memory rate limiter (consider using Redis in production)
const rateLimitStore = new Map<string, number>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  window: 'minute' | 'hour' = 'minute'
): Promise<boolean> {
  const key = rateLimitKey(identifier, window);
  const current = rateLimitStore.get(key) || 0;
  
  if (current >= limit) {
    return false;
  }
  
  rateLimitStore.set(key, current + 1);
  
  // Clean up old entries
  if (rateLimitStore.size > 1000) {
    const keysToDelete = Array.from(rateLimitStore.keys()).slice(0, 500);
    keysToDelete.forEach(k => rateLimitStore.delete(k));
  }
  
  return true;
}

export function sanitizeInput(input: string): string {
  // Remove any potential XSS attempts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function parseFormData(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {};
  
  formData.forEach((value, key) => {
    if (data[key]) {
      // Handle multiple values with the same key
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });
  
  return data;
} 