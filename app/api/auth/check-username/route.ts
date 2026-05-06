import { type NextRequest } from "next/server";
import { err, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-check-username", { windowMs: 10 * 60_000, max: 30 });
  if (limited.limited) {
    return err("Too many username checks. Please wait and try again.", 429);
  }

  const username = request.nextUrl.searchParams.get("username")?.trim() ?? "";
  const excludeUserId = request.nextUrl.searchParams.get("excludeUserId")?.trim() ?? "";

  if (!username) return err("username is required");

  if (!USERNAME_REGEX.test(username)) {
    return ok({
      available: false,
      valid: false,
      reason: "username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen",
    });
  }

  const existing = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return ok({ available: true, valid: true });
  }

  if (excludeUserId && existing.id === excludeUserId) {
    return ok({ available: true, valid: true });
  }

  return ok({ available: false, valid: true, reason: "username is already taken" });
}
