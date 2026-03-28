import { prisma } from "@/lib/prisma";
import {
  deleteUserById,
  getUserById,
  type UpdateProfileInput,
  updateUserProfile,
  upsertUserByAuth,
} from "@/lib/repositories/user-repository";
import type { AuthContext } from "@/lib/services/task-service";
import { adminAuth } from "@/lib/firebase-admin";

export type ProfilePayload = {
  userId: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  major: string | null;
  profilePhotoUrl: string | null;
  profileCompleted: boolean;
};

function toProfilePayload(user: {
  id: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  major: string | null;
  profilePhotoUrl: string | null;
  profileCompleted: boolean;
}): ProfilePayload {
  return {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    major: user.major,
    profilePhotoUrl: user.profilePhotoUrl,
    profileCompleted: user.profileCompleted,
  };
}

export async function ensureAndGetUserProfile(auth: AuthContext): Promise<ProfilePayload> {
  await upsertUserByAuth(auth.userId, auth.email);
  const user = await getUserById(auth.userId);
  if (!user) {
    throw new Error("Failed to load user profile");
  }
  return toProfilePayload(user);
}

export async function completeUserProfile(auth: AuthContext, input: UpdateProfileInput) {
  return prisma.$transaction(async (tx) => {
    await upsertUserByAuth(auth.userId, auth.email, tx);
    const updated = await updateUserProfile(auth.userId, input, tx);
    return toProfilePayload(updated);
  });
}

export async function deleteAccount(auth: AuthContext) {
  await prisma.$transaction(async (tx) => {
    const existingUser = await getUserById(auth.userId, tx);
    if (existingUser) {
      await deleteUserById(auth.userId, tx);
    }
  });

  await adminAuth.deleteUser(auth.userId);
}
