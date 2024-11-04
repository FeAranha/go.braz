/*
  Warnings:

  - You are about to drop the column `timeline_id` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `timelines` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_id]` on the table `timelines` will be added. If there are existing duplicate values, this will fail.
  - Made the column `timeline_id` on table `projects` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `service_id` to the `timelines` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_timeline_id_fkey";

-- DropForeignKey
ALTER TABLE "timelines" DROP CONSTRAINT "timelines_project_id_fkey";

-- DropIndex
DROP INDEX "timelines_project_id_key";

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "timeline_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "timeline_id";

-- AlterTable
ALTER TABLE "timelines" DROP COLUMN "project_id",
ADD COLUMN     "service_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "timelines_service_id_key" ON "timelines"("service_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
