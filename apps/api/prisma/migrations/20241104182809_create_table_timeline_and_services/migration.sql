/*
  Warnings:

  - A unique constraint covering the columns `[timeline_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phase` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeline_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('PRELIMINARY', 'STUDY', 'CORRECTION');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "SEROmeasured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cityProjectApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cndRF" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cnoRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phase" "Phase" NOT NULL,
ADD COLUMN     "projectInExecution" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "protocolSubmittedToCity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxesCollected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeline_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "timelines" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "service_id" TEXT NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "item" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timelines_service_id_key" ON "timelines"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_timeline_id_key" ON "projects"("timeline_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
