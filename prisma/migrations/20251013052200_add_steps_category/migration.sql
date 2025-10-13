/*
  Warnings:

  - Added the required column `category` to the `steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedComplexity` to the `steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learningFocus` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."StepCategory" AS ENUM ('SETUP', 'FOUNDATION', 'FEATURE', 'INTEGRATION', 'POLISH', 'DEPLOYMENT');

-- CreateEnum
CREATE TYPE "public"."StepComplexity" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "public"."steps" ADD COLUMN     "category" "public"."StepCategory" NOT NULL,
ADD COLUMN     "estimatedComplexity" "public"."StepComplexity" NOT NULL,
ADD COLUMN     "learningFocus" TEXT NOT NULL,
ADD COLUMN     "relatedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "content" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "steps_projectId_category_idx" ON "public"."steps"("projectId", "category");
