import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// GET /api/auth/session — verify the caller's Firebase ID token and return
// their userId and email. Clients should pass: Authorization: Bearer <idToken>
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;
  
  // Ensure the user exists in Postgres for FK integrity.
  await prisma.user.upsert({
    where: { id: auth.userId },
    create: { id: auth.userId, email: auth.email ?? null },
    update: { email: auth.email ?? null },
  });

  return ok({ userId: auth.userId, email: auth.email });
}
