-- DropIndex
DROP INDEX "public"."session_token_idx";

-- DropIndex
DROP INDEX "public"."user_email_idx";

-- CreateIndex
CREATE INDEX "account_providerId_accountId_idx" ON "public"."account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "public"."account"("userId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId");

-- CreateIndex
CREATE INDEX "tech_stacks_category_name_idx" ON "public"."tech_stacks"("category", "name");

-- CreateIndex
CREATE INDEX "user_tech_stacks_userId_idx" ON "public"."user_tech_stacks"("userId");

-- CreateIndex
CREATE INDEX "user_tech_stacks_techStackId_idx" ON "public"."user_tech_stacks"("techStackId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "public"."verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "public"."verification"("expiresAt");
