import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok } from "@/lib/api-response";

// GET /api/auth/session — verify the caller's Firebase ID token and return
// their userId and email. Clients should pass: Authorization: Bearer <idToken>
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;
  return ok({ userId: auth.userId, email: auth.email });
}
