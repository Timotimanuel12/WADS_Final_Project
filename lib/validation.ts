/**
 * Input validation utilities
 * Provides strict type-checking and format validation for API inputs
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// Email validation
export function validateEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new ValidationError("Email must be a string", "email", email);
  }

  const trimmed = email.trim();
  if (!trimmed) {
    throw new ValidationError("Email is required", "email", email);
  }

  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new ValidationError("Invalid email format", "email", email);
  }

  if (trimmed.length > 254) {
    throw new ValidationError("Email is too long (max 254 characters)", "email", email);
  }

  return trimmed;
}

// Password validation
export function validatePassword(password: unknown, minLength = 6): string {
  if (typeof password !== "string") {
    throw new ValidationError("Password must be a string", "password", password);
  }

  if (password.length < minLength) {
    throw new ValidationError(
      `Password must be at least ${minLength} characters`,
      "password",
      password
    );
  }

  if (password.length > 128) {
    throw new ValidationError(
      "Password is too long (max 128 characters)",
      "password",
      password
    );
  }

  return password;
}

// Display name validation
export function validateDisplayName(name: unknown): string {
  if (name === null || name === undefined) return "";

  if (typeof name !== "string") {
    throw new ValidationError("Display name must be a string", "displayName", name);
  }

  const trimmed = name.trim();

  if (trimmed.length > 100) {
    throw new ValidationError(
      "Display name is too long (max 100 characters)",
      "displayName",
      name
    );
  }

  // Allow alphanumeric, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z0-9\s\-']*$/.test(trimmed)) {
    throw new ValidationError(
      "Display name contains invalid characters",
      "displayName",
      name
    );
  }

  return trimmed;
}

// Task title validation
export function validateTaskTitle(title: unknown): string {
  if (typeof title !== "string") {
    throw new ValidationError("Title must be a string", "title", title);
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw new ValidationError("Title is required", "title", title);
  }

  if (trimmed.length > 500) {
    throw new ValidationError(
      "Title is too long (max 500 characters)",
      "title",
      title
    );
  }

  return trimmed;
}

// Description validation
export function validateDescription(desc: unknown): string {
  if (desc === null || desc === undefined || desc === "") return "";

  if (typeof desc !== "string") {
    throw new ValidationError("Description must be a string", "description", desc);
  }

  const trimmed = desc.trim();

  if (trimmed.length > 5000) {
    throw new ValidationError(
      "Description is too long (max 5000 characters)",
      "description",
      desc
    );
  }

  return trimmed;
}

// URL validation
export function validateUrl(url: unknown): string {
  if (url === null || url === undefined || url === "") return "";

  if (typeof url !== "string") {
    throw new ValidationError("URL must be a string", "url", url);
  }

  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    return trimmed;
  } catch {
    throw new ValidationError("Invalid URL format", "url", url);
  }
}

// Date validation
export function validateISODate(date: unknown): string {
  if (typeof date !== "string") {
    throw new ValidationError("Date must be a string", "date", date);
  }

  const trimmed = date.trim();
  if (Number.isNaN(Date.parse(trimmed))) {
    throw new ValidationError("Invalid date format (must be ISO 8601)", "date", date);
  }

  return trimmed;
}

// Enum validation
export function validateEnum<T extends readonly string[]>(
  value: unknown,
  validValues: T,
  fieldName: string
): T[number] {
  if (typeof value !== "string") {
    throw new ValidationError(
      `${fieldName} must be a string`,
      fieldName,
      value
    );
  }

  if (!validValues.includes(value as T[number])) {
    throw new ValidationError(
      `${fieldName} must be one of: ${validValues.join(", ")}`,
      fieldName,
      value
    );
  }

  return value as T[number];
}

// MIME type validation
export function validateMimeType(mimeType: unknown): string {
  if (typeof mimeType !== "string") {
    throw new ValidationError("MIME type must be a string", "mimeType", mimeType);
  }

  const trimmed = mimeType.trim();

  // Allow common MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedTypes.includes(trimmed)) {
    throw new ValidationError(
      "MIME type is not allowed",
      "mimeType",
      mimeType
    );
  }

  return trimmed;
}

// Data URL validation
export function validateDataUrl(dataUrl: unknown): string {
  if (typeof dataUrl !== "string") {
    throw new ValidationError("Data URL must be a string", "dataUrl", dataUrl);
  }

  if (!dataUrl.startsWith("data:")) {
    throw new ValidationError(
      "Invalid data URL format",
      "dataUrl",
      dataUrl
    );
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (dataUrl.length > maxSize) {
    throw new ValidationError(
      "Data URL is too large (max 10MB)",
      "dataUrl",
      dataUrl
    );
  }

  return dataUrl;
}

// Generic string validation with length constraints
export function validateString(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): string {
  const { min = 0, max = 10000, required = false } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName, value);
    }
    return "";
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName, value);
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new ValidationError(`${fieldName} is required`, fieldName, value);
  }

  if (trimmed.length < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min} characters`,
      fieldName,
      value
    );
  }

  if (trimmed.length > max) {
    throw new ValidationError(
      `${fieldName} must not exceed ${max} characters`,
      fieldName,
      value
    );
  }

  return trimmed;
}
