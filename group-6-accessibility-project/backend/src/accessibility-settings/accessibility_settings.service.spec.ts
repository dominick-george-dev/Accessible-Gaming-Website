import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilitySettingsService } from './accessibility_settings.service';
import { DatabaseService } from '../database/database.service';

describe('AccessibilitySettingsService', () => {
  let service: AccessibilitySettingsService;

  const mockDatabaseService = {
    userAccessibilitySettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilitySettingsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();    service = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return existing settings for a user', async () => {
      const userId = '123';
      const mockPrismaSettings = {
        userId: 123,
        textSize: '18',
        fontFamily: 'Arial',
        highContrast: true,
        colorBlindMode: 'deuteranopia',
        colourMode: 'dark-mode',
        visualAccessibility: true,
        hearingAccessibility: false,
        motorDexterityAccessibility: true,
        cognitiveAccessibility: false,
        screenMagnifier: true,
      };

      const expectedMappedSettings = {
        textSize: 18,
        fontFamily: 'Arial',
        highContrast: true,
        colorblindFilter: 'deuteranopia',
        theme: 'dark-mode',
        visual: true,
        hearing: false,
        dexterity: true,
        cognitive: false,
        screenMagnifier: true,
      };

      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(mockPrismaSettings);

      const result = await service.getSettings(userId);

      expect(mockDatabaseService.userAccessibilitySettings.findUnique).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
      expect(result).toEqual(expectedMappedSettings);
    });

    it('should create default settings when user settings do not exist', async () => {
      const userId = '456';
      const mockCreatedSettings = {
        userId: 456,
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

      const expectedMappedSettings = {
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
      };

      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(null);
      mockDatabaseService.userAccessibilitySettings.create.mockResolvedValue(mockCreatedSettings);

      const result = await service.getSettings(userId);

      expect(mockDatabaseService.userAccessibilitySettings.findUnique).toHaveBeenCalledWith({
        where: { userId: 456 },
      });
      expect(mockDatabaseService.userAccessibilitySettings.create).toHaveBeenCalledWith({        data: {
          userId: 456,
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
          updatedAt: expect.any(Date) as Date,
        },
      });
      expect(result).toEqual(expectedMappedSettings);
    });

    it('should handle database errors when finding settings', async () => {
      const userId = '789';
      const error = new Error('Database connection error');

      mockDatabaseService.userAccessibilitySettings.findUnique.mockRejectedValue(error);

      await expect(service.getSettings(userId)).rejects.toThrow('Database connection error');
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings with full data', async () => {
      const userId = '123';
      const frontendSettings = {
        textSize: 20,
        fontFamily: 'OpenDyslexic',
        highContrast: true,
        colorblindFilter: 'protanopia',
        theme: 'dark-mode',
        visual: true,
        hearing: true,
        dexterity: false,
        cognitive: true,
        screenMagnifier: false,
      };

      const expectedPrismaData = {
        userId: 123,
        textSize: '20',
        fontFamily: 'OpenDyslexic',
        highContrast: true,
        colorBlindMode: 'protanopia',
        colourMode: 'dark-mode',
        visualAccessibility: true,
        hearingAccessibility: true,        motorDexterityAccessibility: false,
        cognitiveAccessibility: true,
        screenMagnifier: false,
        updatedAt: expect.any(Date) as Date,
      };

      const mockUpdatedSettings = { ...expectedPrismaData };
      const expectedMappedResult = { ...frontendSettings };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateSettings(userId, frontendSettings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 123 },
        update: expectedPrismaData,
        create: expectedPrismaData,
      });
      expect(result).toEqual(expectedMappedResult);
    });

    it('should update settings with partial data using defaults', async () => {
      const userId = '456';
      const partialSettings = {
        textSize: 22,
        highContrast: true,
      };

      const expectedPrismaData = {
        userId: 456,
        textSize: '22',
        fontFamily: 'default',
        highContrast: true,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
        updatedAt: expect.any(Date),
      };

      const mockUpdatedSettings = { ...expectedPrismaData };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateSettings(userId, partialSettings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 456 },
        update: expectedPrismaData,
        create: expectedPrismaData,
      });
      expect(result).toEqual({
        textSize: 22,
        fontFamily: 'default',
        highContrast: true,
        colorblindFilter: 'none',
        theme: 'light-mode',
        visual: false,
        hearing: false,
        dexterity: false,
        cognitive: false,
        screenMagnifier: false,
      });
    });

    it('should handle empty settings object with all defaults', async () => {
      const userId = '789';
      const emptySettings = {};

      const expectedPrismaData = {
        userId: 789,
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
        updatedAt: expect.any(Date),
      };

      const mockUpdatedSettings = { ...expectedPrismaData };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateSettings(userId, emptySettings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 789 },
        update: expectedPrismaData,
        create: expectedPrismaData,
      });
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

    it('should handle database errors during update', async () => {
      const userId = '999';
      const settings = { textSize: 18 };
      const error = new Error('Database update failed');

      mockDatabaseService.userAccessibilitySettings.upsert.mockRejectedValue(error);

      await expect(service.updateSettings(userId, settings)).rejects.toThrow('Database update failed');
    });

    it('should handle null/undefined settings values', async () => {
      const userId = '123';
      const settingsWithNulls = {
        textSize: null,
        fontFamily: undefined,
        highContrast: null,
        colorblindFilter: undefined,
      };

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const expectedPrismaData = {
        userId: 123,
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
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(expectedPrismaData);

      const result = await service.updateSettings(userId, settingsWithNulls);      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 123 },
        update: expect.objectContaining({
          textSize: '16',
          fontFamily: 'default',
          highContrast: false,
          colorBlindMode: 'none',
        }) as any,
        create: expect.objectContaining({
          textSize: '16',
          fontFamily: 'default',
          highContrast: false,
          colorBlindMode: 'none',
        }) as any,
      });
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

    it('should handle non-numeric userId strings', async () => {
      const userId = 'abc123';
      const settings = { textSize: 18 };

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const expectedPrismaData = {
        userId: NaN,
        textSize: '18',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(expectedPrismaData);

      const result = await service.updateSettings(userId, settings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: NaN },
        update: expect.objectContaining({
          userId: NaN,
          textSize: '18',
        }),
        create: expect.objectContaining({
          userId: NaN,
          textSize: '18',
        }),
      });
    });

    it('should handle extreme text size values', async () => {
      const userId = '123';
      const extremeSettings = {
        textSize: 999,
      };

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const expectedPrismaData = {
        userId: 123,
        textSize: '999',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(expectedPrismaData);

      const result = await service.updateSettings(userId, extremeSettings);

      expect(result.textSize).toBe(999);
    });
  });

  describe('mapping functions', () => {
    it('should correctly map frontend to Prisma format', async () => {
      const userId = '123';
      const frontendData = {
        textSize: 24,
        fontFamily: 'Comic Sans MS',
        highContrast: true,
        colorblindFilter: 'tritanopia',
        theme: 'high-contrast',
        visual: true,
        hearing: true,
        dexterity: true,
        cognitive: true,
        screenMagnifier: true,
      };

      // We'll test the mapping by calling updateSettings and checking the upsert call
      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue({
        userId: 123,
        textSize: '24',
        fontFamily: 'Comic Sans MS',
        highContrast: true,
        colorBlindMode: 'tritanopia',
        colourMode: 'high-contrast',
        visualAccessibility: true,
        hearingAccessibility: true,
        motorDexterityAccessibility: true,
        cognitiveAccessibility: true,
        screenMagnifier: true,
        updatedAt: new Date(),
      });

      await service.updateSettings(userId, frontendData);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 123 },
        update: {
          userId: 123,
          textSize: '24',
          fontFamily: 'Comic Sans MS',
          highContrast: true,
          colorBlindMode: 'tritanopia',
          colourMode: 'high-contrast',
          visualAccessibility: true,
          hearingAccessibility: true,
          motorDexterityAccessibility: true,
          cognitiveAccessibility: true,
          screenMagnifier: true,
          updatedAt: expect.any(Date),
        },
        create: {
          userId: 123,
          textSize: '24',
          fontFamily: 'Comic Sans MS',
          highContrast: true,
          colorBlindMode: 'tritanopia',
          colourMode: 'high-contrast',
          visualAccessibility: true,
          hearingAccessibility: true,
          motorDexterityAccessibility: true,
          cognitiveAccessibility: true,
          screenMagnifier: true,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should correctly map Prisma to frontend format', async () => {
      const userId = '456';
      const mockPrismaData = {
        userId: 456,
        textSize: '14',
        fontFamily: 'Times New Roman',
        highContrast: false,
        colorBlindMode: 'monochromacy',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: true,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: true,
        screenMagnifier: false,
      };

      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(mockPrismaData);

      const result = await service.getSettings(userId);

      expect(result).toEqual({
        textSize: 14,
        fontFamily: 'Times New Roman',
        highContrast: false,
        colorblindFilter: 'monochromacy',
        theme: 'light-mode',
        visual: false,
        hearing: true,
        dexterity: false,
        cognitive: true,
        screenMagnifier: false,
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle getSettings when database returns null after user not found', async () => {
      const userId = '123';

      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(null);
      mockDatabaseService.userAccessibilitySettings.create.mockRejectedValue(
        new Error('Failed to create default settings')
      );

      await expect(service.getSettings(userId)).rejects.toThrow('Failed to create default settings');
      
      expect(mockDatabaseService.userAccessibilitySettings.findUnique).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
      expect(mockDatabaseService.userAccessibilitySettings.create).toHaveBeenCalled();
    });

    it('should handle concurrent update conflicts', async () => {
      const userId = '123';
      const settings = { textSize: 18 };
      const error = new Error('Unique constraint failed');

      mockDatabaseService.userAccessibilitySettings.upsert.mockRejectedValue(error);

      await expect(service.updateSettings(userId, settings)).rejects.toThrow('Unique constraint failed');
    });

    it('should handle very large userId numbers', async () => {
      const userId = '9999999999999999999';
      const settings = { textSize: 16 };

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const expectedPrismaData = {
        userId: 9999999999999999999,
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
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(expectedPrismaData);

      await service.updateSettings(userId, settings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 9999999999999999999 },
        update: expect.objectContaining({
          userId: 9999999999999999999,
        }),
        create: expect.objectContaining({
          userId: 9999999999999999999,
        }),
      });
    });
  });

  describe('Data Type Conversion', () => {
    it('should convert textSize from number to string for Prisma', async () => {
      const userId = '123';
      const settings = { textSize: 24 };

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const mockUpdatedSettings = {
        userId: 123,
        textSize: '24',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(mockUpdatedSettings);

      await service.updateSettings(userId, settings);

      expect(mockDatabaseService.userAccessibilitySettings.upsert).toHaveBeenCalledWith({
        where: { userId: 123 },
        update: expect.objectContaining({
          textSize: '24',
        }),
        create: expect.objectContaining({
          textSize: '24',
        }),
      });
    });

    it('should convert textSize from string back to number for frontend', async () => {
      const userId = '123';
      const mockPrismaSettings = {
        userId: 123,
        textSize: '20',
        fontFamily: 'Arial',
        highContrast: false,
        colorBlindMode: 'none',
        colourMode: 'light-mode',
        visualAccessibility: false,
        hearingAccessibility: false,
        motorDexterityAccessibility: false,
        cognitiveAccessibility: false,
        screenMagnifier: false,
      };

      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(mockPrismaSettings);

      const result = await service.getSettings(userId);

      expect(result.textSize).toBe(20);
      expect(typeof result.textSize).toBe('number');
    });
  });

  describe('Default Values Behavior', () => {
    it('should use correct defaults for all accessibility fields', async () => {
      const userId = '123';
      const emptySettings = {};

      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const mockUpdatedSettings = {
        userId: 123,
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
        updatedAt: mockDate,
      };

      mockDatabaseService.userAccessibilitySettings.upsert.mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateSettings(userId, emptySettings);

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
});