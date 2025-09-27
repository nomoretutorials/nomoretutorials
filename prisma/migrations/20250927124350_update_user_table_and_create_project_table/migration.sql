-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "experienceLevel" "public"."ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "techStacks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "techStacks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repositoryUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "public"."projects"("userId");

-- CreateIndex
CREATE INDEX "projects_userId_status_idx" ON "public"."projects"("userId", "status");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_name_idx" ON "public"."user"("name");

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
