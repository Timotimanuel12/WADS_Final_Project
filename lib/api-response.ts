import { sanitizeErrorMessage } from "@/lib/security-middleware";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function ok<T>(data: T, message?: string): Response {
  return Response.json({ success: true, data, ...(message ? { message } : {}) } satisfies ApiResponse<T>);
}

export function created<T>(data: T): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, { status: 201 });
}

/**
 * Generic error response - sanitizes messages to prevent information disclosure
 * @param message - Error message (will be sanitized)
 * @param status - HTTP status code
 * @param isDevelopment - Whether to include detailed error info (development only)
 */
export function err(message: string, status = 400, isDevelopment = false): Response {
  const safeMessage = isDevelopment 
    ? message 
    : sanitizeErrorMessage(new Error(message), false);

  return Response.json({ success: false, error: safeMessage } satisfies ApiResponse, { status });
}

export function unauthorized(message = "Unauthorized"): Response {
  return err(message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return err(message, 403);
}

export function notFound(message = "Not found"): Response {
  return err(message, 404);
}

/**
 * Server error response - always safe in production
 */
export function serverError(isDevelopment = false): Response {
  const message = isDevelopment 
    ? "Internal server error" 
    : "An error occurred processing your request";
  return err(message, 500, isDevelopment);
}
