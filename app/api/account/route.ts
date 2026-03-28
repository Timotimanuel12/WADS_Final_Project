import { type NextRequest } from "next/server";
import { err, ok } from "@/lib/api-response";
import { isAuthError, requireAuth } from "@/lib/auth-middleware";
import { deleteAccount } from "@/lib/services/profile-service";

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    await deleteAccount(auth);
    return ok({ deleted: true });
  } catch {
    return err("Failed to delete account", 500);
  }
}
