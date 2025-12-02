import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AccessibilitySettingsService {
  constructor(private readonly prisma: DatabaseService) {}

  // Map frontend fields to Prisma fields
  private mapToPrisma(userId: string, settings: any) {
    return {
      userId: Number(userId),
      textSize: String(settings.textSize ?? 16),
      fontFamily: settings.fontFamily ?? 'default',
      highContrast: settings.highContrast ?? false,
      colorBlindMode: settings.colorblindFilter ?? 'none',
      colourMode: settings.theme ?? 'light-mode',
      visualAccessibility: settings.visual ?? false,
      hearingAccessibility: settings.hearing ?? false,
      motorDexterityAccessibility: settings.dexterity ?? false,
      cognitiveAccessibility: settings.cognitive ?? false,
      screenMagnifier: settings.screenMagnifier ?? false,
      updatedAt: new Date(),
    };
  }

  // Map Prisma fields to frontend fields
  private mapFromPrisma(prismaSettings: any) {
    return {
      textSize: Number(prismaSettings.textSize),
      fontFamily: prismaSettings.fontFamily,
      highContrast: prismaSettings.highContrast,
      colorblindFilter: prismaSettings.colorBlindMode,
      theme: prismaSettings.colourMode,
      visual: prismaSettings.visualAccessibility,
      hearing: prismaSettings.hearingAccessibility,
      dexterity: prismaSettings.motorDexterityAccessibility,
      cognitive: prismaSettings.cognitiveAccessibility,
      screenMagnifier: prismaSettings.screenMagnifier,
    };
  }

  async getSettings(userId: string) {
    let settings = await this.prisma.userAccessibilitySettings.findUnique({
      where: { userId: Number(userId) },
    });
    if (!settings) {
      // Create default settings if not found
      settings = await this.prisma.userAccessibilitySettings.create({
        data: {
          userId: Number(userId),
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
          updatedAt: new Date(),
        },
      });
    }
    return this.mapFromPrisma(settings);
  }

  async updateSettings(userId: string, settings: any) {
    const data = this.mapToPrisma(userId, settings);
    const updated = await this.prisma.userAccessibilitySettings.upsert({
      where: { userId: Number(userId) },
      update: data,
      create: data,
    });
    return this.mapFromPrisma(updated);
  }
}
