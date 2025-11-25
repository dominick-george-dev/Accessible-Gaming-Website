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
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { UserAccessibilitySettingsService } from './user-accessibility-settings.service';

export class CreateUserAccessibilitySettingsDto {
  // Text settings
  @IsOptional()
  @IsString()
  textSize?: string;
  
  @IsOptional()
  @IsString()
  fontFamily?: string;

  // Visual settings
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;
  
  @IsOptional()
  @IsString()
  colorBlindMode?: string;
  
  @IsOptional()
  @IsString()
  colourMode?: string;

  // Accessibility preferences
  @IsOptional()
  @IsBoolean()
  visualAccessibility?: boolean;
  
  @IsOptional()
  @IsBoolean()
  hearingAccessibility?: boolean;
  
  @IsOptional()
  @IsBoolean()
  motorDexterityAccessibility?: boolean;
  
  @IsOptional()
  @IsBoolean()
  cognitiveAccessibility?: boolean;

  // Magnifier
  @IsOptional()
  @IsBoolean()
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
