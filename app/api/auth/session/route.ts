import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok } from "@/lib/api-response";
import { ensureAndGetUserProfile } from "@/lib/services/profile-service";

// GET /api/auth/session — verify the caller's Firebase ID token and return
// their userId and email. Clients should pass: Authorization: Bearer <idToken>
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const profile = await ensureAndGetUserProfile(auth);
  return ok({
    userId: profile.userId,
    email: profile.email,
    profileCompleted: profile.profileCompleted,
    displayName: profile.displayName,
    username: profile.username,
  });
}
