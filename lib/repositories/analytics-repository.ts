import { prisma } from "@/lib/prisma";

export async function findAnalyticsDataByUserId(userId: string) {
  return Promise.all([
    prisma.task.findMany({ where: { userId } }),
    prisma.focusSession.findMany({ where: { userId } }),
  ]);
}
