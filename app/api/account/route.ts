import { type NextRequest } from "next/server";
import { err, ok } from "@/lib/api-response";
import { isAuthError, requireAuth } from "@/lib/auth-middleware";
import { deleteAccount } from "@/lib/services/profile-service";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const limited = enforceRateLimit(request, "account-delete", { windowMs: 60 * 60_000, max: 3 }, auth.userId);
  if (limited.limited) {
    return err("Too many account deletion attempts. Please wait and try again.", 429);
  }

  try {
    await deleteAccount(auth);
    return ok({ deleted: true });
  } catch {
    return err("Failed to delete account", 500);
  }
}
