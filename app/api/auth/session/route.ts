import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { ensureAndGetUserProfile } from "@/lib/services/profile-service";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/auth/session — verify the caller's Firebase ID token and return
// their userId and email. Clients should pass: Authorization: Bearer <idToken>
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const limited = enforceRateLimit(request, "auth-session", { windowMs: 60_000, max: 60 }, auth.userId);
  if (limited.limited) {
    return err("Too many session requests. Please wait and try again.", 429);
  }

  const profile = await ensureAndGetUserProfile(auth);
  return ok({
    userId: profile.userId,
    email: profile.email,
    profileCompleted: profile.profileCompleted,
    displayName: profile.displayName,
    username: profile.username,
  });
}
