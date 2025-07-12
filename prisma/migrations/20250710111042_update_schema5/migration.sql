/*
  Warnings:

  - A unique constraint covering the columns `[conducteurId]` on the table `Vehicule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conducteurId` to the `Vehicule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "conducteurId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_conducteurId_key" ON "Vehicule"("conducteurId");

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_conducteurId_fkey" FOREIGN KEY ("conducteurId") REFERENCES "Conducteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
