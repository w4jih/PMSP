/*
  Warnings:

  - Added the required column `trajectoryId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "trajectoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Trajectory" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "durationMin" INTEGER,
    "price" DOUBLE PRECISION,

    CONSTRAINT "Trajectory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_trajectoryId_fkey" FOREIGN KEY ("trajectoryId") REFERENCES "Trajectory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
