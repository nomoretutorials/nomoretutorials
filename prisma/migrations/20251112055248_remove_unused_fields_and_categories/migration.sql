/*
  Warnings:

  - The values [QUEUE,AI,PAYMENT,CMS,EMAIL,OTHER] on the enum `TechStackCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isPreferred` on the `user_tech_stacks` table. All the data in the column will be lost.
  - You are about to drop the column `proficiencyLevel` on the `user_tech_stacks` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TechStackCategory_new" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK', 'DATABASE', 'ORM', 'AUTHENTICATION');
ALTER TABLE "public"."tech_stacks" ALTER COLUMN "category" TYPE "public"."TechStackCategory_new" USING ("category"::text::"public"."TechStackCategory_new");
ALTER TYPE "public"."TechStackCategory" RENAME TO "TechStackCategory_old";
ALTER TYPE "public"."TechStackCategory_new" RENAME TO "TechStackCategory";
DROP TYPE "public"."TechStackCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."user_tech_stacks" DROP COLUMN "isPreferred",
DROP COLUMN "proficiencyLevel",
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;
