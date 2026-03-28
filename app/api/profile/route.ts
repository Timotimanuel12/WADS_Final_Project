import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { completeUserProfile, ensureAndGetUserProfile } from "@/lib/services/profile-service";

function sanitizeProfileBody(body: Record<string, unknown>) {
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const university = typeof body.university === "string" ? body.university.trim() : "";
  const major = typeof body.major === "string" ? body.major.trim() : "";
  const profilePhotoUrl =
    typeof body.profilePhotoUrl === "string"
      ? body.profilePhotoUrl.trim()
      : body.profilePhotoUrl === null
        ? null
        : undefined;

  return { username, firstName, lastName, university, major, profilePhotoUrl };
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const profile = await ensureAndGetUserProfile(auth);
    return ok(profile);
  } catch {
    return err("Failed to load profile", 500);
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const normalized = sanitizeProfileBody(body as Record<string, unknown>);

  if (!normalized.username) return err("username is required");
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(normalized.username)) {
    return err("username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen");
  }
  if (!normalized.firstName) return err("firstName is required");
  if (!normalized.lastName) return err("lastName is required");
  if (typeof normalized.profilePhotoUrl === "string") {
    const isAllowedUrl =
      normalized.profilePhotoUrl.startsWith("data:image/") ||
      normalized.profilePhotoUrl.startsWith("https://") ||
      normalized.profilePhotoUrl.startsWith("http://");

    if (!isAllowedUrl) {
      return err("profilePhotoUrl must be an image data URL or an http/https URL");
    }

    if (normalized.profilePhotoUrl.length > 2_000_000) {
      return err("profilePhotoUrl is too large");
    }
  }

  try {
    const profile = await completeUserProfile(auth, {
      username: normalized.username,
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      university: normalized.university || undefined,
      major: normalized.major || undefined,
      profilePhotoUrl: normalized.profilePhotoUrl === "" ? null : normalized.profilePhotoUrl,
      displayName: `${normalized.firstName} ${normalized.lastName}`.trim(),
    });

    return ok(profile);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return err("username is already taken", 409);
    }
    return err("Failed to update profile", 500);
  }
}
