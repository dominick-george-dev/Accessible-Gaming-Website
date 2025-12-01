-- CreateTable
CREATE TABLE "AccessibilityIssues" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL DEFAULT 'No Message Added',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessibilityIssues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favourites" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Favourites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessibilityIssues_userId_key" ON "AccessibilityIssues"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favourites_userId_key" ON "Favourites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favourites_gameId_key" ON "Favourites"("gameId");

-- AddForeignKey
ALTER TABLE "AccessibilityIssues" ADD CONSTRAINT "AccessibilityIssues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourites" ADD CONSTRAINT "Favourites_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourites" ADD CONSTRAINT "Favourites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
