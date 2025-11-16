/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserAccessibilitySettingsController } from './user-accessibility-settings.controller';
import { UserAccessibilitySettingsService } from './user-accessibility-settings.service';

describe('UserAccessibilitySettingsController', () => {
  let controller: UserAccessibilitySettingsController;
  let service: jest.Mocked<UserAccessibilitySettingsService>;

  beforeEach(async () => {
    const mockService = {
      createUserAccessibilitySettings: jest.fn(),
      getUserAccessibilitySettingsWithDefaults: jest.fn(),
      upsertUserAccessibilitySettings: jest.fn(),
      deleteUserAccessibilitySettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAccessibilitySettingsController],
      providers: [
        {
          provide: UserAccessibilitySettingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserAccessibilitySettingsController>(
      UserAccessibilitySettingsController,
    );
    service = module.get(UserAccessibilitySettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserAccessibilitySettings', () => {
    it('should return user accessibility settings', async () => {
      const mockSettings = {
        id: 1,
        userId: 1,
        textSize: 'large',
        darkMode: true,
      };

      service.getUserAccessibilitySettingsWithDefaults.mockResolvedValue(
        mockSettings as any,
      );

      const result = await controller.getUserAccessibilitySettings(1);

      expect(
        service.getUserAccessibilitySettingsWithDefaults,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSettings);
    });

    it('should return default settings when user has no custom settings', async () => {
      const defaultSettings = {
        textSize: 'medium',
        fontFamily: 'default',
        highContrast: false,
        colorBlindMode: 'none',
        darkMode: false,
        textToSpeech: false,
        keyboardNavigation: false,
        voiceCommands: false,
        simplifiedInterface: false,
      };

      service.getUserAccessibilitySettingsWithDefaults.mockResolvedValue(
        defaultSettings as any,
      );

      const result = await controller.getUserAccessibilitySettings(999);

      expect(
        service.getUserAccessibilitySettingsWithDefaults,
      ).toHaveBeenCalledWith(999);
      expect(result).toEqual(defaultSettings);
    });
  });

  describe('updateUserAccessibilitySettings', () => {
    it('should update user accessibility settings successfully', async () => {
      const updateDto = {
        textSize: 'large',
        darkMode: true,
        highContrast: true,
      };

      const updatedSettings = {
        id: 1,
        userId: 1,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.upsertUserAccessibilitySettings.mockResolvedValue(
        updatedSettings as any,
      );

      const result = await controller.updateUserAccessibilitySettings(
        1,
        updateDto,
      );
      expect(service.upsertUserAccessibilitySettings).toHaveBeenCalledWith(
        1,
        updateDto,
      );
      expect(result).toEqual(updatedSettings);
    });
  });

  describe('createUserAccessibilitySettings', () => {
    it('should create new user accessibility settings', async () => {
      const createDto = {
        textSize: 'large',
        darkMode: true,
      };

      const createdSettings = {
        id: 1,
        userId: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.createUserAccessibilitySettings.mockResolvedValue(
        createdSettings as any,
      );

      const result = await controller.createUserAccessibilitySettings(
        1,
        createDto,
      );
      expect(service.createUserAccessibilitySettings).toHaveBeenCalledWith(
        1,
        createDto,
      );
      expect(result).toEqual(createdSettings);
    });
  });

  describe('deleteUserAccessibilitySettings', () => {
    it('should delete user accessibility settings', async () => {
      const deletedSettings = {
        id: 1,
        userId: 1,
        textSize: 'large',
        darkMode: true,
      };

      service.deleteUserAccessibilitySettings.mockResolvedValue(
        deletedSettings as any,
      );

      const result = await controller.deleteUserAccessibilitySettings(1);
      expect(service.deleteUserAccessibilitySettings).toHaveBeenCalledWith(1);
      expect(result).toEqual(deletedSettings);
    });
  });
});
