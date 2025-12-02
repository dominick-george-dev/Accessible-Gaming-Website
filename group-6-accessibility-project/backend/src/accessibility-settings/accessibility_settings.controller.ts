import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { AccessibilitySettingsService } from './accessibility_settings.service';

@Controller('api/accessibility-settings')
export class AccessibilitySettingsController {
  constructor(private readonly service: AccessibilitySettingsService) {}

  @Get(':userId')
  async getSettings(@Param('userId') userId: string) {
    console.log('Getting settings for user:', userId);
    const settings = await this.service.getSettings(userId);
    console.log('Retrieved settings:', settings);
    return settings;
  }
  @Put(':userId')
  async updateSettings(
    @Param('userId') userId: string,
    @Body() settings: any
  ) {
    console.log('\n=== ACCESSIBILITY SETTINGS UPDATE ===');
    console.log('📝 Controller: Update request received');
    console.log('👤 User ID:', userId);
    console.log('📊 Raw settings data received:');
    console.log(JSON.stringify(settings, null, 2));
    
    try {
      console.log('⚙️  Controller: Calling service.updateSettings...');
      const updatedSettings = await this.service.updateSettings(userId, settings);
      
      console.log('✅ Controller: Service call successful');
      console.log('📤 Controller: Returning updated settings to frontend:');
      console.log(JSON.stringify(updatedSettings, null, 2));
      console.log('=== UPDATE COMPLETE ===\n');
      
      return updatedSettings;
    } catch (error) {
      console.log('❌ Controller: Error occurred during update');
      console.log('🚨 Error details:', error);
      console.log('=== UPDATE FAILED ===\n');
      throw error;
    }
  }
}
