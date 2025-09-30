/*
  Warnings:

  - The values [ROADMAP] on the enum `StepStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[projectId,index]` on the table `steps` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."ProjectStatus" ADD VALUE 'CONFIGURING';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StepStatus_new" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'IN_PROGRESS');
ALTER TABLE "public"."steps" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."steps" ALTER COLUMN "status" TYPE "public"."StepStatus_new" USING ("status"::text::"public"."StepStatus_new");
ALTER TYPE "public"."StepStatus" RENAME TO "StepStatus_old";
ALTER TYPE "public"."StepStatus_new" RENAME TO "StepStatus";
DROP TYPE "public"."StepStatus_old";
ALTER TABLE "public"."steps" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "public"."steps_projectId_index_idx";

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "currentStepIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."steps" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "projects_userId_currentStepIndex_idx" ON "public"."projects"("userId", "currentStepIndex");

-- CreateIndex
CREATE INDEX "steps_projectId_status_idx" ON "public"."steps"("projectId", "status");

-- CreateIndex
CREATE INDEX "steps_projectId_isCompleted_idx" ON "public"."steps"("projectId", "isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "steps_projectId_index_key" ON "public"."steps"("projectId", "index");
