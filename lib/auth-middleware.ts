import { adminAuth } from "@/lib/firebase-admin";
import { unauthorized } from "@/lib/api-response";

export type AuthResult = { userId: string; email?: string };

export async function requireAuth(
  request: Request
): Promise<AuthResult | Response> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid Authorization header");
  }
  const token = authorization.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { userId: decoded.uid, email: decoded.email };
  } catch {
    return unauthorized("Invalid or expired token");
  }
}

export function isAuthError(
  result: AuthResult | Response
): result is Response {
  return result instanceof Response;
}
