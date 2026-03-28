-- CreateIndex
CREATE INDEX "FocusSession_userId_completedAt_idx" ON "public"."FocusSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "Task_userId_updatedAt_idx" ON "public"."Task"("userId", "updatedAt");

-- AddCheckConstraint
ALTER TABLE "public"."Task"
ADD CONSTRAINT "Task_start_before_end_chk"
CHECK ("startTime" < "endTime");

-- AddCheckConstraint
ALTER TABLE "public"."FocusSession"
ADD CONSTRAINT "FocusSession_duration_positive_chk"
CHECK ("durationMinutes" > 0);

-- AddCheckConstraint
ALTER TABLE "public"."FocusSession"
ADD CONSTRAINT "FocusSession_started_before_completed_chk"
CHECK ("startedAt" <= "completedAt");
