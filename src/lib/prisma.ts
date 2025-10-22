import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as Sentry from "@sentry/nextjs";

// Helper factory to create the Prisma client
function createPrismaClient() {
  const databaseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRISMA_ACCELERATE_URL
      : process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("⚠️ DATABASE_URL or PRISMA_ACCELERATE_URL is missing in environment variables!");
  }

  const basePrisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
    errorFormat: "pretty",
  });

  const prisma =
    process.env.NODE_ENV === "production" ? basePrisma.$extends(withAccelerate()) : basePrisma;

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = Date.now();
          try {
            const result = await query(args);
            const duration = Date.now() - start;

            // Warn for slow queries
            if (duration > 1000) {
              console.warn(`🐌 Slow Prisma query (${duration}ms):`, { model, operation });
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
            const duration = Date.now() - start;
            console.error(`❌ Prisma query error (${duration}ms):`, {
              model,
              operation,
              error: error instanceof Error ? error.message : error,
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
