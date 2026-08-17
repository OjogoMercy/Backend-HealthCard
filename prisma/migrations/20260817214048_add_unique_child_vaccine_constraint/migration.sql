/*
  Warnings:

  - A unique constraint covering the columns `[childId,vaccineId]` on the table `Immunisation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Immunisation_childId_vaccineId_key" ON "Immunisation"("childId", "vaccineId");
