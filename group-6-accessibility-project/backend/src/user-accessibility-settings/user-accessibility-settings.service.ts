import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface CreateUserAccessibilitySettingsData {
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

@Injectable()
export class UserAccessibilitySettingsService {
  constructor(private readonly database: DatabaseService) {}
  async createUserAccessibilitySettings(
    userId: number,
    data: CreateUserAccessibilitySettingsData,
  ) {
    return await this.database.userAccessibilitySettings.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async getUserAccessibilitySettings(userId: number) {
    return await this.database.userAccessibilitySettings.findUnique({
      where: { userId },
      include: { user: true },
    });
  }
  async updateUserAccessibilitySettings(
    userId: number,
    data: Partial<CreateUserAccessibilitySettingsData>,
  ) {
    return await this.database.userAccessibilitySettings.update({
      where: { userId },
      data,
    });
  }

  async deleteUserAccessibilitySettings(userId: number) {
    return await this.database.userAccessibilitySettings.delete({
      where: { userId },
    });
  }
  async upsertUserAccessibilitySettings(
    userId: number,
    data: Partial<CreateUserAccessibilitySettingsData>,
  ) {
    return await this.database.userAccessibilitySettings.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  // Get accessibility settings with default values if user has no custom settings
  async getUserAccessibilitySettingsWithDefaults(userId: number) {
    const settings = await this.getUserAccessibilitySettings(userId);

    if (!settings) {
      // Return default accessibility settings matching the database schema
      return {
        textSize: '16',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
      };
    }

    return settings;
  }
}
