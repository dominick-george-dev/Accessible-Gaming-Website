/*
  Warnings:

  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `colorMode` on the `UserAccessibilitySettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('USER', 'ADMIN', 'PUBLISHER');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "hasBeenVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "publisherId" INTEGER,
ADD COLUMN     "trailer" TEXT,
ADD COLUMN     "transcript" TEXT,
ALTER COLUMN "publisher" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'USER',
ALTER COLUMN "password" SET DEFAULT 'NEEDS_PASSWORD_RESET',
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "UserAccessibilitySettings" DROP COLUMN "colorMode",
ADD COLUMN     "colourMode" TEXT NOT NULL DEFAULT 'light-mode',
ALTER COLUMN "textSize" SET DEFAULT 'medium',
ALTER COLUMN "textSize" SET DATA TYPE TEXT;

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
