// Test script to verify backend API integration
// Run this in browser console or as a Node.js script

const API_BASE_URL = 'http://localhost:3001';

async function testAccessibilityAPI() {
  console.log('🧪 Testing Accessibility Settings API...\n');
  
  try {
    // Test 1: Create user accessibility settings
    console.log('1. Creating accessibility settings for user 1...');
    const createResponse = await fetch(`${API_BASE_URL}/user-accessibility-settings/1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textSize: '18',
        fontFamily: 'default',
        highContrast: true,
        colorBlindMode: 'none',
        darkMode: false,
        textToSpeech: false,
        keyboardNavigation: true,
        voiceCommands: false,
        simplifiedInterface: false,
      }),
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Created:', createData);
    } else {
      console.log('❌ Create failed:', createResponse.status, createResponse.statusText);
    }

    // Test 2: Get user accessibility settings
    console.log('\n2. Getting accessibility settings for user 1...');
    const getResponse = await fetch(`${API_BASE_URL}/user-accessibility-settings/1`);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Retrieved:', getData);
    } else {
      console.log('❌ Get failed:', getResponse.status, getResponse.statusText);
    }

    // Test 3: Update user accessibility settings
    console.log('\n3. Updating accessibility settings for user 1...');
    const updateResponse = await fetch(`${API_BASE_URL}/user-accessibility-settings/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textSize: '20',
        darkMode: true,
        highContrast: false,
      }),
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Updated:', updateData);
    } else {
      console.log('❌ Update failed:', updateResponse.status, updateResponse.statusText);
    }

    // Test 4: Get updated settings
    console.log('\n4. Getting updated settings...');
    const getUpdatedResponse = await fetch(`${API_BASE_URL}/user-accessibility-settings/1`);
    
    if (getUpdatedResponse.ok) {
      const getUpdatedData = await getUpdatedResponse.json();
      console.log('✅ Retrieved updated:', getUpdatedData);
    } else {
      console.log('❌ Get updated failed:', getUpdatedResponse.status, getUpdatedResponse.statusText);
    }

    console.log('\n🎉 API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure your backend server is running on http://localhost:3001');
  }
}

// Run the test if in browser
if (typeof window !== 'undefined') {
  testAccessibilityAPI();
}

// Export for Node.js usage
if (typeof module !== 'undefined') {
  module.exports = { testAccessibilityAPI };
}
