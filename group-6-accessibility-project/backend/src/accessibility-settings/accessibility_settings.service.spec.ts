import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilitySettingsService } from './accessibility_settings.service';
import { DatabaseService } from '../database/database.service';

const mockPrisma = {
  userAccessibilitySettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('AccessibilitySettingsService', () => {
  let service: AccessibilitySettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilitySettingsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return mapped settings if found', async () => {
      const dbSettings = {
        userId: 1,
        textSize: '18',
        fontFamily: 'Arial',
        highContrast: true,
        colorBlindMode: 'protanopia',
        colourMode: 'dark-mode',
        visualAccessibility: true,
        hearingAccessibility: false,
        motorDexterityAccessibility: true,
        cognitiveAccessibility: false,
        screenMagnifier: true,
        updatedAt: new Date(),
      };
      mockPrisma.userAccessibilitySettings.findUnique.mockResolvedValue(dbSettings);
      const result = await service.getSettings('1');
      expect(result).toEqual({
        textSize: 18,
        fontFamily: 'Arial',
        highContrast: true,
        colorblindFilter: 'protanopia',
        theme: 'dark-mode',
        visual: true,
        hearing: false,
        dexterity: true,
        cognitive: false,
        screenMagnifier: true,
      });
    });

    it('should create and return default settings if not found', async () => {
      mockPrisma.userAccessibilitySettings.findUnique.mockResolvedValue(null);
      const defaultSettings = {
        userId: 1,
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
      };
      mockPrisma.userAccessibilitySettings.create.mockResolvedValue(defaultSettings);
      const result = await service.getSettings('1');
      expect(result).toEqual({
        textSize: 16,
        fontFamily: 'default',
        highContrast: false,
        colorblindFilter: 'none',
        theme: 'light-mode',
        visual: false,
        hearing: false,
        dexterity: false,
        cognitive: false,
        screenMagnifier: false,
      });
    });
  });

  describe('updateSettings', () => {
    it('should upsert and return mapped settings', async () => {
      const inputSettings = {
        textSize: 20,
        fontFamily: 'Verdana',
        highContrast: true,
        colorblindFilter: 'deuteranopia',
        theme: 'dark-mode',
        visual: true,
        hearing: true,
        dexterity: false,
        cognitive: true,
        screenMagnifier: true,
      };
      const upserted = {
        userId: 1,
        textSize: '20',
        fontFamily: 'Verdana',
        highContrast: true,
        colorBlindMode: 'deuteranopia',
        colourMode: 'dark-mode',
        visualAccessibility: true,
        hearingAccessibility: true,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: true,
        screenMagnifier: true,
        updatedAt: new Date(),
      };
      mockPrisma.userAccessibilitySettings.upsert.mockResolvedValue(upserted);
      const result = await service.updateSettings('1', inputSettings);
      expect(result).toEqual({
        textSize: 20,
        fontFamily: 'Verdana',
        highContrast: true,
        colorblindFilter: 'deuteranopia',
        theme: 'dark-mode',
        visual: true,
        hearing: true,
        dexterity: false,
        cognitive: true,
        screenMagnifier: true,
      });
    });

    it('should throw error if upsert fails', async () => {
      mockPrisma.userAccessibilitySettings.upsert.mockRejectedValue(new Error('DB error'));
      await expect(service.updateSettings('1', {})).rejects.toThrow('DB error');
    });
  });
});
