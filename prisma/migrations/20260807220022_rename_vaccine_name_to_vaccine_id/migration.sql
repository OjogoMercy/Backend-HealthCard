/*
  Warnings:

  - You are about to drop the column `vaccineName` on the `Immunisation` table. All the data in the column will be lost.
  - Added the required column `vaccineId` to the `Immunisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Immunisation" DROP COLUMN "vaccineName",
ADD COLUMN     "vaccineId" TEXT NOT NULL;
