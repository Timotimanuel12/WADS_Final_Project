/**
 * Security middleware utilities
 * Provides CORS, rate limiting, and security headers
 */

import { NextResponse, type NextRequest } from "next/server";

// Rate limiting state (in-memory, for development/single-instance deployments)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "X-Total-Count"],
  maxAge: 86400, // 24 hours
};

/**
 * Adds CORS headers to response
 * @param response - The response to add headers to
 * @param origin - The requesting origin
 * @returns Response with CORS headers
 */
export function addCorsHeaders(response: Response, origin?: string): Response {
  const isOriginAllowed =
    !origin ||
    CORS_CONFIG.allowedOrigins.includes(origin) ||
    CORS_CONFIG.allowedOrigins.includes("*");

  if (isOriginAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", CORS_CONFIG.allowedMethods.join(", "));
    response.headers.set("Access-Control-Allow-Headers", CORS_CONFIG.allowedHeaders.join(", "));
    response.headers.set("Access-Control-Expose-Headers", CORS_CONFIG.exposedHeaders.join(", "));
    response.headers.set("Access-Control-Max-Age", CORS_CONFIG.maxAge.toString());
  }

  return response;
}

/**
 * Handles CORS preflight OPTIONS requests
 * @param origin - The requesting origin
 * @returns Preflight response
 */
export function handleCorsPrelight(origin?: string): Response {
  const response = new Response(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

/**
 * Security headers to prevent common attacks
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff", // Prevents MIME type sniffing
  "X-Frame-Options": "DENY", // Prevents clickjacking
  "X-XSS-Protection": "1; mode=block", // Legacy XSS protection
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains", // HSTS
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

/**
 * Adds security headers to response
 * @param response - The response to add headers to
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: Response): Response {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Rate limiting: allows N requests per window
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Gets rate limit info for an identifier
 * @param identifier - Unique identifier
 * @returns Rate limit info or null if not tracked
 */
export function getRateLimitInfo(identifier: string): { count: number; resetTime: number } | null {
  return rateLimitMap.get(identifier) || null;
}

/**
 * Clears rate limit for an identifier
 * @param identifier - Unique identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Returns a rate limit exceeded response
 * @param retryAfterSeconds - Seconds to wait before retrying
 * @returns Rate limit exceeded response
 */
export function rateLimitExceeded(retryAfterSeconds: number = 60): Response {
  const response = new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      statusText: "Too Many Requests",
    }
  );

  response.headers.set("Retry-After", retryAfterSeconds.toString());
  response.headers.set("Content-Type", "application/json");

  return response;
}

/**
 * Input size limit middleware
 * Prevents extremely large payloads
 */
export function checkContentLength(request: NextRequest, maxBytes: number = 1048576): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return true; // No length header, assume OK
  return parseInt(contentLength) <= maxBytes;
}

/**
 * Validates request method
 * @param request - The request to validate
 * @param allowedMethods - Array of allowed methods
 * @returns true if method is allowed
 */
export function isMethodAllowed(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * Validates content type
 * @param request - The request to validate
 * @param expectedContentType - Expected content type
 * @returns true if content type matches
 */
export function validateContentType(
  request: NextRequest,
  expectedContentType: string = "application/json"
): boolean {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  return contentType === expectedContentType;
}

/**
 * Extracts client IP from request
 * Respects X-Forwarded-For header (when behind proxy)
 * @param request - The request
 * @returns Client IP address
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Try other headers commonly set by proxies
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Creates a secure response wrapper
 * @param data - Response data
 * @param options - Response options
 * @returns Secure response with all headers set
 */
export function createSecureResponse(
  data: unknown,
  options: {
    status?: number;
    origin?: string;
    includeSecurityHeaders?: boolean;
  } = {}
): Response {
  const {
    status = 200,
    origin,
    includeSecurityHeaders = true,
  } = options;

  const response = NextResponse.json(data, { status });

  // Add CORS headers
  addCorsHeaders(response, origin);

  // Add security headers
  if (includeSecurityHeaders) {
    addSecurityHeaders(response);
  }

  // NoCache headers for sensitive data
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

/**
 * Sanitizes error messages for client (strips sensitive info)
 * @param error - The error object
 * @param isDevelopment - Whether in development mode
 * @returns Safe error message
 */
export function sanitizeErrorMessage(
  error: unknown,
  isDevelopment: boolean = false
): string {
  if (isDevelopment && error instanceof Error) {
    return error.message;
  }

  // Generic message in production
  return "An error occurred processing your request";
}
