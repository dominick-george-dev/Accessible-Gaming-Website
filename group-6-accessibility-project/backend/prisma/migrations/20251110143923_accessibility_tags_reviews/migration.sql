-- CreateTable
CREATE TABLE "AccessibilityTags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessibilityTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAccessibilityTags" (
    "gameId" INTEGER NOT NULL,
    "accessibilityTagsId" INTEGER NOT NULL,

    CONSTRAINT "GameAccessibilityTags_pkey" PRIMARY KEY ("gameId","accessibilityTagsId")
);

-- AddForeignKey
ALTER TABLE "GameAccessibilityTags" ADD CONSTRAINT "GameAccessibilityTags_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccessibilityTags" ADD CONSTRAINT "GameAccessibilityTags_accessibilityTagsId_fkey" FOREIGN KEY ("accessibilityTagsId") REFERENCES "AccessibilityTags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
