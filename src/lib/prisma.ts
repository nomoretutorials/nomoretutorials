import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as Sentry from "@sentry/nextjs";

function createPrismaClient() {
  const databaseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRISMA_ACCELERATE_URL
      : process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "❌ DATABASE_URL or PRISMA_ACCELERATE_URL is missing in environment variables!"
    );
  }

  const client = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
    errorFormat: "pretty",
  });

  const acceleratedClient =
    process.env.NODE_ENV === "production" ? client.$extends(withAccelerate()) : client;

  return acceleratedClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = performance.now();
          try {
            const result = await query(args);
            const duration = performance.now() - start;

            if (duration > 1000) {
              console.warn(`🐌 Slow Prisma query (${duration.toFixed(0)}ms):`, {
                model,
                operation,
              });
              if (process.env.NODE_ENV === "production") {
                Sentry.addBreadcrumb({
                  category: "database",
                  message: `Slow query: ${model}.${operation}`,
                  level: "warning",
                  data: { duration, model, operation },
                });
              }
            }

            return result;
          } catch (error) {
            const duration = performance.now() - start;
            console.error(`❌ Prisma query error (${duration.toFixed(0)}ms):`, {
              model,
              operation,
              error,
            });

            Sentry.captureException(error, {
              tags: { component: "database", operation: `${model}.${operation}` },
              extra: { duration, model, operation },
            });

            throw error;
          }
        },
      },
    },
  });
}

// --- Global cache to prevent multiple instances ---
const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Use cached Prisma client or create a new one
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
