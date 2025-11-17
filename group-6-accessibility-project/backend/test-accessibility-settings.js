// Test script to verify UserAccessibilitySettings creation
const fetch = require('node-fetch');

const testUserRegistration = async () => {
  try {
    // Test data
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    console.log('Testing user registration with automatic accessibility settings creation...');
    console.log('User data:', userData);

    // Register a new user
    const registerResponse = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const registerResult = await registerResponse.json();
    console.log('Registration response:', registerResult);

    if (registerResponse.ok && registerResult.user) {
      const userId = registerResult.user.id;
      const token = registerResult.access_token;

      // Check if accessibility settings were created
      console.log(`\nChecking accessibility settings for user ID: ${userId}`);
      
      const settingsResponse = await fetch(`http://localhost:3000/user-accessibility-settings/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const settingsResult = await settingsResponse.json();
      console.log('Accessibility settings response:', settingsResult);

      if (settingsResponse.ok && settingsResult) {
        console.log('\n✅ SUCCESS: UserAccessibilitySettings were automatically created with default values!');
        console.log('Default settings:', {
          textSize: settingsResult.textSize,
          fontFamily: settingsResult.fontFamily,
          highContrast: settingsResult.highContrast,
          colorBlindMode: settingsResult.colorBlindMode,
          colourMode: settingsResult.colourMode,
          visualAccessibility: settingsResult.visualAccessibility,
          hearingAccessibility: settingsResult.hearingAccessibility,
          motorDexterityAccessibility: settingsResult.motorDexterityAccessibility,
          cognitiveAccessibility: settingsResult.cognitiveAccessibility,
          screenMagnifier: settingsResult.screenMagnifier
        });
      } else {
        console.log('\n❌ FAILED: UserAccessibilitySettings were NOT created automatically');
        console.log('Error:', settingsResult);
      }
    } else {
      console.log('\n❌ FAILED: User registration failed');
      console.log('Error:', registerResult);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
};

// Wait for server to start, then run test
setTimeout(testUserRegistration, 5000);
