import Pool from "pg-pool";

export const pgPool = new Pool({
  connectionString:
    process.env.NODE_ENV === "production"
      ? process.env.PRISMA_ACCELERATE_URL
      : process.env.DATABASE_URL,
});
