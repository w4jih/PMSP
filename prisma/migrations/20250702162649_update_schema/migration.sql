/*
  Warnings:

  - Added the required column `password` to the `Conducteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Passager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conducteur" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Passager" ADD COLUMN     "password" TEXT NOT NULL;
