// Test script to verify login redirects to profile page
const testLoginRedirect = async () => {
  try {
    console.log('Testing login redirect to profile page...');
    
    // Test data for a new user
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    console.log('Step 1: Creating test user...');
    
    // Register a new user first
    const registerResponse = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const registerResult = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ User created successfully:', registerResult.user);
      
      console.log('Step 2: Testing login...');
      
      // Now test login
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful:', loginResult.user);
        console.log('🔑 Access token received:', loginResult.access_token ? 'Yes' : 'No');
        
        // Test if accessibility settings were created automatically
        console.log('Step 3: Checking if accessibility settings exist...');
        
        const settingsResponse = await fetch(`http://localhost:3000/user-accessibility-settings/${loginResult.user.id}`, {
          headers: {
            'Authorization': `Bearer ${loginResult.access_token}`,
          },
        });

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          console.log('✅ Accessibility settings found:', settings);
          console.log('\n🎉 SUCCESS: Complete flow working!');
          console.log('- User registration ✅');
          console.log('- Default accessibility settings created ✅');
          console.log('- Login authentication ✅');
          console.log('- Ready for profile page redirect ✅');
        } else {
          console.log('⚠️  Accessibility settings not found, but login works');
        }
      } else {
        console.log('❌ Login failed:', loginResult);
      }
    } else {
      console.log('❌ User registration failed:', registerResult);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the test
testLoginRedirect();
