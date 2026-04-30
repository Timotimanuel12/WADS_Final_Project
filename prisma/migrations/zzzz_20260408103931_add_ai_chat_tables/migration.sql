-- CreateTable
CREATE TABLE "public"."AIChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIChatConversation_userId_idx" ON "public"."AIChatConversation"("userId");

-- CreateIndex
CREATE INDEX "AIChatConversation_userId_updatedAt_idx" ON "public"."AIChatConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AIChatMessage_conversationId_idx" ON "public"."AIChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AIChatMessage_conversationId_createdAt_idx" ON "public"."AIChatMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AIChatConversation" ADD CONSTRAINT "AIChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIChatMessage" ADD CONSTRAINT "AIChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."AIChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
