/*
  Warnings:

  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `invites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,user_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_user_id_fkey";

-- DropIndex
DROP INDEX "accounts_provider_userId_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "user_id",
ADD COLUMN     "author_id" TEXT;

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "avatar_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "avatar_url" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_user_id_key" ON "accounts"("provider", "user_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
