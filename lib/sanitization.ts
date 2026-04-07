/**
 * Input sanitization utilities
 * Prevents XSS, injection attacks, and other common vulnerabilities
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param str - The string to escape
 * @returns Escaped HTML-safe string
 */
export function escapeHtml(str: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitizes string input by removing potentially dangerous characters
 * @param str - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  // Remove control characters
  let sanitized = str.replace(/[\x00-\x1F\x7F]/g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  return sanitized.trim();
}

/**
 * Sanitizes HTML content by removing script tags and event handlers
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  return sanitized;
}

/**
 * Sanitizes SQL-like queries to prevent SQL injection
 * Note: Never trust this alone - always use parameterized queries
 * @param str - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeSqlInput(str: string): string {
  // Remove or escape dangerous SQL characters
  let sanitized = str.replace(/['";\\]/g, "\\$&");

  // Remove common SQL keywords
  sanitized = sanitized.replace(/(\b(DROP|DELETE|INSERT|UPDATE|SELECT|CREATE|ALTER|UNION|EXEC|EXECUTE)\b)/gi, "");

  return sanitized;
}

/**
 * Sanitizes JSON strings to prevent injection
 * @param str - The string to sanitize
 * @returns Safe JSON string
 */
export function sanitizeJsonString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Sanitizes URL path segments to prevent directory traversal attacks
 * @param path - The path segment to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: string): string {
  // Remove directory traversal attempts
  let sanitized = path.replace(/\.\./g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove leading slashes (relative paths only)
  sanitized = sanitized.replace(/^\/+/, "");

  return sanitized;
}

/**
 * Sanitizes filename to prevent directory traversal and other attacks
 * @param filename - The filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory separators
  let sanitized = filename.replace(/[\/\\]/g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  // Keep only alphanumeric, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized || "file";
}

/**
 * Escapes regular expression special characters
 * @param str - The string to escape
 * @returns Escaped regex string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes and sanitizes email addresses
 * @param email - The email to sanitize
 * @returns Normalized email
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/**
 * Removes ANSI escape codes from strings (prevents terminal injection)
 * @param str - The string to sanitize
 * @returns String without ANSI codes
 */
export function sanitizeAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "");
}

/**
 * Generic sanitizer that applies common sanitization
 * @param value - The value to sanitize
 * @param options - Sanitization options
 * @returns Sanitized value
 */
export function sanitize(
  value: string,
  options: {
    removeHtml?: boolean;
    removeControl?: boolean;
    removeNull?: boolean;
    trim?: boolean;
  } = {}
): string {
  const {
    removeHtml = true,
    removeControl = true,
    removeNull = true,
    trim: shouldTrim = true,
  } = options;

  let result = value;

  if (removeHtml) {
    result = sanitizeHtml(result);
  }

  if (removeControl) {
    result = result.replace(/[\x00-\x1F\x7F]/g, "");
  }

  if (removeNull) {
    result = result.replace(/\0/g, "");
  }

  if (shouldTrim) {
    result = result.trim();
  }

  return result;
}
