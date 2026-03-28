import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaQueryLoggingInitialized?: boolean;
};

const shouldLogQueries = process.env.PRISMA_LOG_QUERIES === "true";
const slowQueryThresholdMs = Math.max(
  1,
  Number(process.env.PRISMA_SLOW_QUERY_MS ?? "300")
);

const prismaLog: Array<Prisma.LogLevel | Prisma.LogDefinition> =
  process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

if (shouldLogQueries) {
  prismaLog.push({ emit: "event", level: "query" });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLog,
  });

if (shouldLogQueries && !globalForPrisma.prismaQueryLoggingInitialized) {
  const prismaWithQueryEvents = prisma as PrismaClient<Prisma.PrismaClientOptions, "query">;
  prismaWithQueryEvents.$on("query", (event) => {
    if (event.duration >= slowQueryThresholdMs) {
      console.warn("[Prisma slow query]", {
        durationMs: event.duration,
        target: event.target,
        query: event.query,
      });
    }
  });
  globalForPrisma.prismaQueryLoggingInitialized = true;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

