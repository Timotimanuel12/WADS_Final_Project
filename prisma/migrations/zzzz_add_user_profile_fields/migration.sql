-- AlterTable
ALTER TABLE "public"."User"
ADD COLUMN "username" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "university" TEXT,
ADD COLUMN "major" TEXT,
ADD COLUMN "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
