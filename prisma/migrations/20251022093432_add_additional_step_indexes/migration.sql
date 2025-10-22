-- CreateIndex
CREATE INDEX "projects_userId_createdAt_idx" ON "public"."projects"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "steps_completedAt_idx" ON "public"."steps"("completedAt");

-- CreateIndex
CREATE INDEX "user_lastLoginAt_idx" ON "public"."user"("lastLoginAt");
