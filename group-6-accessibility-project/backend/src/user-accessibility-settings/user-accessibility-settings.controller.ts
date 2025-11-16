import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserAccessibilitySettingsService } from './user-accessibility-settings.service';

export class CreateUserAccessibilitySettingsDto {
  // Text settings
  textSize?: string;
  fontFamily?: string;

  // Visual settings
  highContrast?: boolean;
  colorBlindMode?: string;
  colourMode?: string;

  // Accessibility preferences
  visualAccessibility?: boolean;
  hearingAccessibility?: boolean;
  motorDexterityAccessibility?: boolean;
  cognitiveAccessibility?: boolean;

  // Magnifier
  screenMagnifier?: boolean;
}

@Controller('user-accessibility-settings')
export class UserAccessibilitySettingsController {
  constructor(
    private readonly userAccessibilitySettingsService: UserAccessibilitySettingsService,
  ) {}

  @Post(':userId')
  async createUserAccessibilitySettings(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    createUserAccessibilitySettingsDto: CreateUserAccessibilitySettingsDto,
  ) {
    return this.userAccessibilitySettingsService.createUserAccessibilitySettings(
      userId,
      createUserAccessibilitySettingsDto,
    );
  }
  @Get(':userId')
  async getUserAccessibilitySettings(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userAccessibilitySettingsService.getUserAccessibilitySettingsWithDefaults(
      userId,
    );
  }
  @Put(':userId')
  async updateUserAccessibilitySettings(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    updateUserAccessibilitySettingsDto: CreateUserAccessibilitySettingsDto,
  ) {
    return this.userAccessibilitySettingsService.upsertUserAccessibilitySettings(
      userId,
      updateUserAccessibilitySettingsDto,
    );
  }
  @Delete(':userId')
  async deleteUserAccessibilitySettings(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userAccessibilitySettingsService.deleteUserAccessibilitySettings(
      userId,
    );
  }
}
