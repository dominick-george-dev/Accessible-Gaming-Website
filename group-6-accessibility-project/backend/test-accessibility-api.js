// Test script to verify user accessibility settings are saved to database
const BASE_URL = 'http://localhost:3000'; // Change this to your server port

// Test data
const testUserId = 1;
const testSettings = {
  textSize: 'large',
  fontFamily: 'dyslexia-friendly',
  highContrast: true,
  colorBlindMode: 'protanopia',
  darkMode: true,
  textToSpeech: true,
  keyboardNavigation: true,
  voiceCommands: false,
  simplifiedInterface: true
};

async function testAccessibilitySettingsAPI() {
  console.log('🚀 Testing User Accessibility Settings API...\n');

  try {
    // 1. Test GET (should return defaults for new user)
    console.log('1️⃣ Testing GET /user-accessibility-settings/' + testUserId);
    const getResponse1 = await fetch(`${BASE_URL}/user-accessibility-settings/${testUserId}`);
    const initialSettings = await getResponse1.json();
    console.log('📥 Initial settings:', JSON.stringify(initialSettings, null, 2));
    console.log('✅ GET request successful\n');

    // 2. Test PUT (create/update settings)
    console.log('2️⃣ Testing PUT /user-accessibility-settings/' + testUserId);
    const putResponse = await fetch(`${BASE_URL}/user-accessibility-settings/${testUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSettings)
    });
    
    if (!putResponse.ok) {
      throw new Error(`PUT failed with status: ${putResponse.status}`);
    }
    
    const savedSettings = await putResponse.json();
    console.log('💾 Saved settings:', JSON.stringify(savedSettings, null, 2));
    console.log('✅ PUT request successful\n');

    // 3. Test GET again (should return updated settings)
    console.log('3️⃣ Testing GET again to verify persistence');
    const getResponse2 = await fetch(`${BASE_URL}/user-accessibility-settings/${testUserId}`);
    const retrievedSettings = await getResponse2.json();
    console.log('🔍 Retrieved settings:', JSON.stringify(retrievedSettings, null, 2));

    // 4. Verify settings were saved correctly
    console.log('4️⃣ Verifying data persistence...');
    const settingsMatch = Object.keys(testSettings).every(key => {
      const saved = retrievedSettings[key];
      const expected = testSettings[key];
      const match = saved === expected;
      if (!match) {
        console.log(`❌ Mismatch for ${key}: expected ${expected}, got ${saved}`);
      }
      return match;
    });

    if (settingsMatch) {
      console.log('🎉 SUCCESS: All settings were saved and retrieved correctly!');
    } else {
      console.log('❌ FAILURE: Some settings were not saved correctly');
    }

    // 5. Test with different user (should return defaults)
    console.log('\n5️⃣ Testing with different user (should return defaults)');
    const getResponse3 = await fetch(`${BASE_URL}/user-accessibility-settings/999`);
    const defaultSettings = await getResponse3.json();
    console.log('📥 Default settings for user 999:', JSON.stringify(defaultSettings, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('- Make sure the backend server is running on the correct port');
    console.log('- Check that the database is connected');
    console.log('- Verify the UserAccessibilitySettingsModule is imported in app.module.ts');
  }
}

// Helper function to test with Node.js fetch (if available) or provide browser instructions
if (typeof fetch !== 'undefined') {
  testAccessibilitySettingsAPI();
} else {
  console.log('🌐 To run this test in Node.js, you need Node.js 18+ or install node-fetch');
  console.log('📋 Copy this code into your browser console while on localhost:3000 to test');
}
