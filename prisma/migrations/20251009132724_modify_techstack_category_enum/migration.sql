/*
  Warnings:

  - The values [DEVOPS] on the enum `TechStackCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TechStackCategory_new" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'ORM', 'AUTHENTICATION', 'QUEUE', 'AI', 'PAYMENT', 'CMS', 'EMAIL', 'OTHER');
ALTER TABLE "public"."tech_stacks" ALTER COLUMN "category" TYPE "public"."TechStackCategory_new" USING ("category"::text::"public"."TechStackCategory_new");
ALTER TYPE "public"."TechStackCategory" RENAME TO "TechStackCategory_old";
ALTER TYPE "public"."TechStackCategory_new" RENAME TO "TechStackCategory";
DROP TYPE "public"."TechStackCategory_old";
COMMIT;
