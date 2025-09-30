-- CreateEnum
CREATE TYPE "public"."StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ROADMAP');

-- CreateTable
CREATE TABLE "public"."steps" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."StepStatus" NOT NULL DEFAULT 'PENDING',
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "steps_projectId_index_idx" ON "public"."steps"("projectId", "index");

-- AddForeignKey
ALTER TABLE "public"."steps" ADD CONSTRAINT "steps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
