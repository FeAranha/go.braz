/*
  Warnings:

  - You are about to drop the column `service_id` on the `timelines` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id]` on the table `timelines` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeline_id` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `timelines` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_timeline_id_fkey";

-- DropForeignKey
ALTER TABLE "timelines" DROP CONSTRAINT "timelines_service_id_fkey";

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "timeline_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "timeline_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "timelines" DROP COLUMN "service_id",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "timelines_project_id_key" ON "timelines"("project_id");

-- AddForeignKey
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
