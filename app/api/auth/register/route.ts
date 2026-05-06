import { type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { created, err } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-register", { windowMs: 10 * 60_000, max: 5 });
  if (limited.limited) {
    return err("Too many registration attempts. Please wait and try again.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { email, password, displayName } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) return err("email is required");
  if (typeof password !== "string" || password.length < 6)
    return err("password must be at least 6 characters");

  try {
    const user = await adminAuth.createUser({
      email: email.trim(),
      password,
      displayName: typeof displayName === "string" ? displayName : undefined,
    });
    return created({ uid: user.uid, email: user.email, displayName: user.displayName });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "auth/email-already-exists") return err("Email already in use", 409);
    return err("Registration failed", 500);
  }
}
