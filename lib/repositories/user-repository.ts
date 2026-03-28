import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const userProfileSelect = {
  id: true,
  email: true,
  displayName: true,
  username: true,
  firstName: true,
  lastName: true,
  university: true,
  major: true,
  profilePhotoUrl: true,
  profileCompleted: true,
} satisfies Prisma.UserSelect;

export async function upsertUserByAuth(userId: string, email?: string, db: DbClient = prisma) {
  return db.user.upsert({
    where: { id: userId },
    create: { id: userId, email: email ?? null },
    update: { email: email ?? null },
    select: userProfileSelect,
  });
}

export async function getUserById(userId: string, db: DbClient = prisma) {
  return db.user.findUnique({ where: { id: userId }, select: userProfileSelect });
}

export async function deleteUserById(userId: string, db: DbClient = prisma) {
  return db.user.delete({ where: { id: userId } });
}

export type UpdateProfileInput = {
  username: string;
  firstName: string;
  lastName: string;
  university?: string;
  major?: string;
  displayName?: string;
  profilePhotoUrl?: string | null;
};

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
  db: DbClient = prisma
) {
  return db.user.update({
    where: { id: userId },
    data: {
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      university: input.university ?? null,
      major: input.major ?? null,
      profilePhotoUrl: input.profilePhotoUrl === undefined ? undefined : input.profilePhotoUrl,
      displayName: input.displayName ?? `${input.firstName} ${input.lastName}`.trim(),
      profileCompleted: true,
    },
    select: userProfileSelect,
  });
}
