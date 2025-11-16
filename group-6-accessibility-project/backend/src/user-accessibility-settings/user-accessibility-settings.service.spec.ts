import { Test, TestingModule } from '@nestjs/testing';
import { UserAccessibilitySettingsService } from './user-accessibility-settings.service';
import { DatabaseService } from '../database/database.service';

describe('UserAccessibilitySettingsService', () => {
  let service: UserAccessibilitySettingsService;
  let mockDatabaseService: any;

  beforeEach(async () => {
    const mockDatabase = {
      userAccessibilitySettings: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAccessibilitySettingsService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<UserAccessibilitySettingsService>(
      UserAccessibilitySettingsService,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockDatabaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getUserAccessibilitySettingsWithDefaults', () => {
    it('should return default settings when user has no custom settings', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(
        null,
      );

      const result = await service.getUserAccessibilitySettingsWithDefaults(1);

      expect(result).toEqual({
        textSize: 'medium',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        darkMode: false,
        textToSpeech: false,
        keyboardNavigation: false,
        voiceCommands: false,
        simplifiedInterface: false,
      });
    });

    it('should return user settings when they exist', async () => {
      const mockSettings = {
        id: 1,
        userId: 1,
        textSize: 'large',
        fontFamily: 'dyslexia-friendly',
        highContrast: true,
        colorBlindMode: 'protanopia',
        darkMode: true,
        textToSpeech: true,
        keyboardNavigation: true,
        voiceCommands: false,
        simplifiedInterface: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockDatabaseService.userAccessibilitySettings.findUnique.mockResolvedValue(
        mockSettings,
      );

      const result = await service.getUserAccessibilitySettingsWithDefaults(1);

      expect(result).toEqual(mockSettings);
    });
  });
});
