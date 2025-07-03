-- CreateTable
CREATE TABLE "Conducteur" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "Cin" TEXT NOT NULL,

    CONSTRAINT "Conducteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passager" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "Cin" TEXT NOT NULL,

    CONSTRAINT "Passager_pkey" PRIMARY KEY ("id")
);
