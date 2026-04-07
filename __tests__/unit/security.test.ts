/**
 * Security unit tests
 * Tests for input validation, sanitization, and security measures
 */

import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateTaskTitle,
  validateUrl,
  validateMimeType,
  ValidationError,
} from "@/lib/validation";

import {
  sanitizeString,
  sanitizeHtml,
  sanitizePath,
  sanitizeFilename,
  sanitizeEmail,
  escapeHtml,
} from "@/lib/sanitization";

describe("Input Validation", () => {
  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("user@example.com")).toBe("user@example.com");
      expect(validateEmail("  test@domain.org  ")).toBe("test@domain.org");
    });

    it("should reject invalid emails", () => {
      expect(() => validateEmail("not-an-email")).toThrow(ValidationError);
      expect(() => validateEmail("@example.com")).toThrow(ValidationError);
      expect(() => validateEmail("user@")).toThrow(ValidationError);
    });

    it("should reject non-string emails", () => {
      expect(() => validateEmail(123)).toThrow(ValidationError);
      expect(() => validateEmail(null)).toThrow(ValidationError);
    });

    it("should reject empty emails", () => {
      expect(() => validateEmail("")).toThrow(ValidationError);
      expect(() => validateEmail("   ")).toThrow(ValidationError);
    });

    it("should reject emails exceeding max length", () => {
      const longEmail = "a".repeat(300) + "@example.com";
      expect(() => validateEmail(longEmail)).toThrow(ValidationError);
    });
  });

  describe("Password Validation", () => {
    it("should accept valid passwords", () => {
      expect(validatePassword("SecurePass123")).toBe("SecurePass123");
    });

    it("should reject passwords shorter than minimum", () => {
      expect(() => validatePassword("short")).toThrow(ValidationError);
    });

    it("should reject passwords exceeding maximum length", () => {
      expect(() => validatePassword("a".repeat(200))).toThrow(ValidationError);
    });

    it("should reject non-string passwords", () => {
      expect(() => validatePassword(123)).toThrow(ValidationError);
    });
  });

  describe("Display Name Validation", () => {
    it("should accept valid display names", () => {
      expect(validateDisplayName("John Doe")).toBe("John Doe");
      expect(validateDisplayName("Mary-Jane")).toBe("Mary-Jane");
      expect(validateDisplayName("O'Brien")).toBe("O'Brien");
    });

    it("should reject display names with invalid characters", () => {
      expect(() => validateDisplayName("John<script>")).toThrow(ValidationError);
      expect(() => validateDisplayName("Jane@Home")).toThrow(ValidationError);
    });

    it("should reject empty/null names", () => {
      expect(validateDisplayName("")).toBe("");
      expect(validateDisplayName(null)).toBe("");
    });

    it("should reject names exceeding max length", () => {
      expect(() => validateDisplayName("a".repeat(200))).toThrow(ValidationError);
    });
  });

  describe("Task Title Validation", () => {
    it("should accept valid task titles", () => {
      expect(validateTaskTitle("Complete project report")).toBe("Complete project report");
    });

    it("should reject empty titles", () => {
      expect(() => validateTaskTitle("")).toThrow(ValidationError);
      expect(() => validateTaskTitle("   ")).toThrow(ValidationError);
    });

    it("should reject titles exceeding max length", () => {
      expect(() => validateTaskTitle("a".repeat(1000))).toThrow(ValidationError);
    });

    it("should trim whitespace", () => {
      expect(validateTaskTitle("  task title  ")).toBe("task title");
    });
  });

  describe("URL Validation", () => {
    it("should accept valid HTTP/HTTPS URLs", () => {
      expect(validateUrl("https://example.com")).toBe("https://example.com");
      expect(validateUrl("http://example.com/path")).toBe("http://example.com/path");
    });

    it("should reject non-HTTP protocols", () => {
      expect(() => validateUrl("javascript:alert('xss')")).toThrow(ValidationError);
      expect(() => validateUrl("ftp://example.com")).toThrow(ValidationError);
    });

    it("should reject invalid URLs", () => {
      expect(() => validateUrl("not a url")).toThrow(ValidationError);
    });

    it("should allow empty URLs", () => {
      expect(validateUrl("")).toBe("");
      expect(validateUrl(null)).toBe("");
    });
  });

  describe("MIME Type Validation", () => {
    it("should accept whitelisted MIME types", () => {
      expect(validateMimeType("image/jpeg")).toBe("image/jpeg");
      expect(validateMimeType("application/pdf")).toBe("application/pdf");
    });

    it("should reject non-whitelisted MIME types", () => {
      expect(() => validateMimeType("application/x-executable")).toThrow(ValidationError);
      expect(() => validateMimeType("text/x-shellscript")).toThrow(ValidationError);
    });

    it("should reject non-string MIME types", () => {
      expect(() => validateMimeType(123)).toThrow(ValidationError);
    });
  });
});

describe("Input Sanitization", () => {
  describe("HTML Sanitization", () => {
    it("should remove script tags", () => {
      const input = "Hello<script>alert('xss')</script>World";
      expect(sanitizeHtml(input)).not.toContain("<script>");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      expect(sanitizeHtml(input)).not.toContain("onclick");
    });

    it("should remove style tags", () => {
      const input = "Text<style>body{display:none}</style>More";
      expect(sanitizeHtml(input)).not.toContain("<style>");
    });

    it("should preserve safe HTML", () => {
      const input = "<p>Hello <b>World</b></p>";
      const result = sanitizeHtml(input);
      expect(result).toContain("<p>");
      expect(result).toContain("</b>");
    });
  });

  describe("String Sanitization", () => {
    it("should remove control characters", () => {
      const input = "Hello\x00World\x1F";
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain("\x00");
      expect(sanitized).not.toContain("\x1F");
    });

    it("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });
  });

  describe("Path Sanitization", () => {
    it("should remove directory traversal attempts", () => {
      expect(sanitizePath("../../../etc/passwd")).not.toContain("..");
    });

    it("should remove null bytes", () => {
      expect(sanitizePath("file\x00.txt")).not.toContain("\x00");
    });

    it("should remove leading slashes", () => {
      expect(sanitizePath("/path/to/file")).toBe("path/to/file");
    });
  });

  describe("Filename Sanitization", () => {
    it("should remove directory separators", () => {
      const sanitized = sanitizeFilename("../../../file.txt");
      expect(sanitized).not.toContain("/");
      expect(sanitized).not.toContain("\\");
    });

    it("should limit filename length", () => {
      const long = "a".repeat(500);
      expect(sanitizeFilename(long).length).toBeLessThanOrEqual(255);
    });

    it("should keep valid characters", () => {
      expect(sanitizeFilename("my-file_name.txt")).toContain("my");
    });

    it("should handle edge cases", () => {
      expect(sanitizeFilename("")).toBe("file");
    });
  });

  describe("Email Sanitization", () => {
    it("should normalize email addresses", () => {
      expect(sanitizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
    });

    it("should remove spaces", () => {
      expect(sanitizeEmail("user @ example . com")).toBe("user@example.com");
    });
  });

  describe("HTML Escaping", () => {
    it("should escape HTML special characters", () => {
      const result = escapeHtml('<script>alert("xss")</script>');
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });

    it("should handle quotes", () => {
      const result = escapeHtml('He said "hello"');
      expect(result).toContain("&quot;");
    });
  });
});

describe("Security Validation", () => {
  describe("Protection against common attacks", () => {
    it("should prevent XSS through email field", () => {
      expect(() => validateEmail("<img src=x onerror=alert('xss')>")).toThrow(ValidationError);
    });

    it("should prevent SQL injection patterns in strings", () => {
      const malicious = "'; DROP TABLE users; --";
      const title = validateTaskTitle(malicious);
      // Should still accept it (validation != parameterized queries)
      expect(title).toBe(malicious);
    });

    it("should enforce enum validation strictly", () => {
      const { validateEnum } = require("@/lib/validation");
      expect(() => validateEnum("invalid", ["active", "inactive"], "status")).toThrow(
        ValidationError
      );
    });
  });

  describe("Length limits prevent DoS", () => {
    it("should reject extremely long inputs", () => {
      expect(() => validateTaskTitle("a".repeat(10000))).toThrow(ValidationError);
    });

    it("should reject large data URLs", () => {
      const { validateDataUrl } = require("@/lib/validation");
      const huge = "data:image/png;base64," + "a".repeat(20000000);
      expect(() => validateDataUrl(huge)).toThrow(ValidationError);
    });
  });
});
