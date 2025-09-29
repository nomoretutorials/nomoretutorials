-- CreateEnum
CREATE TYPE "public"."StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ROADMAP');

-- CreateTable
CREATE TABLE "public"."Steps" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."StepStatus" NOT NULL DEFAULT 'PENDING',
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Steps_projectId_index_idx" ON "public"."Steps"("projectId", "index");

-- AddForeignKey
ALTER TABLE "public"."Steps" ADD CONSTRAINT "Steps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
