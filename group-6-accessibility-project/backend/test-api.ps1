# PowerShell script to test User Accessibility Settings API
# Make sure your backend server is running first!

$baseUrl = "http://localhost:3000"  # Change this to your server port
$userId = 1

Write-Host "🚀 Testing User Accessibility Settings API..." -ForegroundColor Green
Write-Host ""

# Test settings to save
$testSettings = @{
    textSize = "large"
    fontFamily = "dyslexia-friendly"
    highContrast = $true
    colorBlindMode = "protanopia"
    darkMode = $true
    textToSpeech = $true
    keyboardNavigation = $true
    voiceCommands = $false
    simplifiedInterface = $true
} | ConvertTo-Json

try {
    # 1. Test GET (initial state)
    Write-Host "1️⃣ Getting initial settings..." -ForegroundColor Cyan
    $initialResponse = Invoke-RestMethod -Uri "$baseUrl/user-accessibility-settings/$userId" -Method GET
    Write-Host "📥 Initial settings:" -ForegroundColor Yellow
    $initialResponse | ConvertTo-Json -Depth 3 | Write-Host
    Write-Host ""

    # 2. Test PUT (save settings)
    Write-Host "2️⃣ Saving new settings..." -ForegroundColor Cyan
    $saveResponse = Invoke-RestMethod -Uri "$baseUrl/user-accessibility-settings/$userId" -Method PUT -Body $testSettings -ContentType "application/json"
    Write-Host "💾 Saved settings:" -ForegroundColor Yellow
    $saveResponse | ConvertTo-Json -Depth 3 | Write-Host
    Write-Host ""

    # 3. Test GET (verify persistence)
    Write-Host "3️⃣ Retrieving settings to verify persistence..." -ForegroundColor Cyan
    $retrievedResponse = Invoke-RestMethod -Uri "$baseUrl/user-accessibility-settings/$userId" -Method GET
    Write-Host "🔍 Retrieved settings:" -ForegroundColor Yellow
    $retrievedResponse | ConvertTo-Json -Depth 3 | Write-Host
    Write-Host ""

    # 4. Verify the data matches
    Write-Host "4️⃣ Verification Results:" -ForegroundColor Green
    if ($retrievedResponse.textSize -eq "large") { Write-Host "✅ textSize saved correctly" -ForegroundColor Green } else { Write-Host "❌ textSize not saved" -ForegroundColor Red }
    if ($retrievedResponse.fontFamily -eq "dyslexia-friendly") { Write-Host "✅ fontFamily saved correctly" -ForegroundColor Green } else { Write-Host "❌ fontFamily not saved" -ForegroundColor Red }
    if ($retrievedResponse.highContrast -eq $true) { Write-Host "✅ highContrast saved correctly" -ForegroundColor Green } else { Write-Host "❌ highContrast not saved" -ForegroundColor Red }
    if ($retrievedResponse.darkMode -eq $true) { Write-Host "✅ darkMode saved correctly" -ForegroundColor Green } else { Write-Host "❌ darkMode not saved" -ForegroundColor Red }
    
    Write-Host ""
    Write-Host "🎉 Test completed! Check the results above." -ForegroundColor Green

} catch {
    Write-Host "❌ Error testing API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure the backend server is running on port 3000" -ForegroundColor White
    Write-Host "- Check the database connection" -ForegroundColor White
    Write-Host "- Verify the UserAccessibilitySettings endpoints are working" -ForegroundColor White
}

Write-Host ""
Write-Host "📊 To check the database directly, you can also use Prisma Studio:" -ForegroundColor Cyan
Write-Host "cd backend && npx prisma studio" -ForegroundColor White
