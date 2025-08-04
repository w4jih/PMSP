/*
  Warnings:

  - Added the required column `kmprice` to the `Conducteur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conducteur" ADD COLUMN     "kmprice" DOUBLE PRECISION NOT NULL;
