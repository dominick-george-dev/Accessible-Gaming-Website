import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { AccessibilitySettingsService } from './accessibility_settings.service';

@Controller('api/accessibility-settings')
export class AccessibilitySettingsController {
  constructor(private readonly service: AccessibilitySettingsService) {}

  @Get(':userId')
  async getSettings(@Param('userId') userId: string) {
    return this.service.getSettings(userId);
  }

  @Put(':userId')
  async updateSettings(
    @Param('userId') userId: string,
    @Body() settings: any
  ) {
    return this.service.updateSettings(userId, settings);
  }
}
