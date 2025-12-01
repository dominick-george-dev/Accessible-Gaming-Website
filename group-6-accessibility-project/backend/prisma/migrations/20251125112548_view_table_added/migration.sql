/*
  Warnings:

  - You are about to drop the column `publisher` on the `Game` table. All the data in the column will be lost.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('USER', 'ADMIN', 'PUBLISHER');

-- CreateEnum
CREATE TYPE "categories" AS ENUM ('Visual', 'Hearing', 'Dexterity', 'Cognitive');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "publisher",
ADD COLUMN     "hasBeenVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "publisherId" INTEGER,
ADD COLUMN     "trailer" TEXT,
ADD COLUMN     "transcript" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'USER',
ALTER COLUMN "password" SET DEFAULT 'NEEDS_PASSWORD_RESET',
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "UserAccessibilitySettings" ALTER COLUMN "colourMode" SET DEFAULT 'light-mode',
ALTER COLUMN "colourMode" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Publisher" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT,
    "profilePicture" TEXT,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "publisherId" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
