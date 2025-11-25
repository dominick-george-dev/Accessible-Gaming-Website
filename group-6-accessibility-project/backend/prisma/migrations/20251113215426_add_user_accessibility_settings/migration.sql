-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccessibilitySettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "textSize" TEXT NOT NULL DEFAULT 'medium',
    "fontFamily" TEXT NOT NULL DEFAULT 'default',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "colorBlindMode" TEXT NOT NULL DEFAULT 'none',
    "colourMode" BOOLEAN NOT NULL DEFAULT false,
    "visualAccessibility" BOOLEAN NOT NULL DEFAULT false,
    "hearingAccessibility" BOOLEAN NOT NULL DEFAULT false,
    "motorDexterityAccessibility" BOOLEAN NOT NULL DEFAULT false,
    "cognitiveAccessibility" BOOLEAN NOT NULL DEFAULT false,
    "screenMagnifier" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccessibilitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccessibilitySettings_userId_key" ON "UserAccessibilitySettings"("userId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessibilitySettings" ADD CONSTRAINT "UserAccessibilitySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
