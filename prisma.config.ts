import "dotenv/config";

// Prisma v7 configuration
// The DATABASE_URL is now managed here instead of in schema.prisma

const prismaConfig = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // DATABASE_URL is read from environment variables via dotenv/config above
};

export default prismaConfig;
