-- CreateEnum
CREATE TYPE "public"."TechStackCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'OTHER');

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "features" JSONB;

-- CreateTable
CREATE TABLE "public"."tech_stacks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."TechStackCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tech_stacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "techStackId" TEXT NOT NULL,
    "proficiencyLevel" "public"."ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tech_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_tech_stacks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "techStackId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tech_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tech_stacks_name_key" ON "public"."tech_stacks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_stacks_slug_key" ON "public"."tech_stacks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_tech_stacks_userId_techStackId_key" ON "public"."user_tech_stacks"("userId", "techStackId");

-- CreateIndex
CREATE UNIQUE INDEX "project_tech_stacks_projectId_techStackId_key" ON "public"."project_tech_stacks"("projectId", "techStackId");

-- AddForeignKey
ALTER TABLE "public"."user_tech_stacks" ADD CONSTRAINT "user_tech_stacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tech_stacks" ADD CONSTRAINT "user_tech_stacks_techStackId_fkey" FOREIGN KEY ("techStackId") REFERENCES "public"."tech_stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_tech_stacks" ADD CONSTRAINT "project_tech_stacks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_tech_stacks" ADD CONSTRAINT "project_tech_stacks_techStackId_fkey" FOREIGN KEY ("techStackId") REFERENCES "public"."tech_stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
