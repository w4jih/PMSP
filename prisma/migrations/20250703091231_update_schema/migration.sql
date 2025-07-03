/*
  Warnings:

  - Added the required column `email` to the `Conducteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Passager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conducteur" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Passager" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
