import { type NextRequest } from "next/server";
import { err, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const parsedBody = body as { identifier?: unknown };

  const identifier = typeof parsedBody.identifier === "string"
    ? parsedBody.identifier.trim()
    : "";

  if (!identifier) return err("identifier is required");

  if (EMAIL_REGEX.test(identifier)) {
    return ok({ email: identifier });
  }

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: identifier,
        mode: "insensitive",
      },
    },
    select: {
      email: true,
    },
  });

  if (!user?.email) {
    // Generic message to avoid account enumeration.
    return err("Incorrect email/username or password", 401);
  }

  return ok({ email: user.email });
}
