-- Create a test user directly in PostgreSQL
INSERT INTO "User" (email, username, "createdAt", "updatedAt") 
VALUES ('test@example.com', 'testuser', NOW(), NOW())
RETURNING id;

-- If user ID is 1, create accessibility settings
INSERT INTO "UserAccessibilitySettings" (
  "userId", 
  "textSize", 
  "fontFamily", 
  "highContrast", 
  "colorBlindMode", 
  "darkMode", 
  "textToSpeech", 
  "keyboardNavigation", 
  "voiceCommands", 
  "simplifiedInterface",
  "createdAt",
  "updatedAt"
) VALUES (
  1,  -- Replace with the actual user ID from above
  'large',
  'dyslexia-friendly', 
  true,
  'protanopia',
  true,
  true,
  true,
  false,
  true,
  NOW(),
  NOW()
);
