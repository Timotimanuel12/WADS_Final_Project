import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "7a9be912-c9f4-4dd7-b0f9-5d8b6ef89c55";

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: "demo.user@example.com",
      displayName: "Demo User",
    },
    create: {
      id: userId,
      email: "demo.user@example.com",
      displayName: "Demo User",
    },
  });

  const task = await prisma.task.upsert({
    where: { id: "f5cf17db-b5d9-4a2f-8c20-e5b7f7885d7b" },
    update: {
      title: "Finish WADS report draft",
      description: "Draft the main report sections and references.",
      status: "in-progress",
      priority: "high",
      category: "Academic",
      course: "WADS",
      startTime: new Date("2026-03-28T09:00:00.000Z"),
      endTime: new Date("2026-03-28T11:00:00.000Z"),
    },
    create: {
      id: "f5cf17db-b5d9-4a2f-8c20-e5b7f7885d7b",
      userId,
      title: "Finish WADS report draft",
      description: "Draft the main report sections and references.",
      status: "in-progress",
      priority: "high",
      category: "Academic",
      course: "WADS",
      startTime: new Date("2026-03-28T09:00:00.000Z"),
      endTime: new Date("2026-03-28T11:00:00.000Z"),
    },
  });

  await prisma.focusSession.upsert({
    where: { id: "f8483b62-9639-4d95-a2f3-52f9754e5a3f" },
    update: {
      durationMinutes: 50,
      startedAt: new Date("2026-03-28T09:00:00.000Z"),
      completedAt: new Date("2026-03-28T09:50:00.000Z"),
      notes: "Solid focus block, no distractions.",
      taskId: task.id,
      userId,
    },
    create: {
      id: "f8483b62-9639-4d95-a2f3-52f9754e5a3f",
      userId,
      taskId: task.id,
      durationMinutes: 50,
      startedAt: new Date("2026-03-28T09:00:00.000Z"),
      completedAt: new Date("2026-03-28T09:50:00.000Z"),
      notes: "Solid focus block, no distractions.",
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
