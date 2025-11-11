/*
  Warnings:

  - Added the required column `userName` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "accessibilityFeedback" TEXT[],
ADD COLUMN     "helpful" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userName" TEXT NOT NULL;
