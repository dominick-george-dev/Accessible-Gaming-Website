-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "publisher" TEXT;

-- DropEnum
DROP TYPE "categories";

-- CreateTable
CREATE TABLE "View" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
