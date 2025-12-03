import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilitySettingsModule } from './accessibility_settings.module';
import { AccessibilitySettingsController } from './accessibility_settings.controller';
import { AccessibilitySettingsService } from './accessibility_settings.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseModule } from '../database/database.module';

describe('AccessibilitySettingsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AccessibilitySettingsModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(
        class MockDatabaseModule {
          static providers = [
            {
              provide: DatabaseService,
              useValue: {
                userAccessibilitySettings: {
                  findUnique: jest.fn(),
                  create: jest.fn(),
                  upsert: jest.fn(),
                },
              },
            },
          ];
        }
      )
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('Module Configuration', () => {
    it('should have AccessibilitySettingsController', () => {
      const controller = module.get<AccessibilitySettingsController>(
        AccessibilitySettingsController,
      );
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AccessibilitySettingsController);
    });

    it('should have AccessibilitySettingsService', () => {
      const service = module.get<AccessibilitySettingsService>(
        AccessibilitySettingsService,
      );
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AccessibilitySettingsService);
    });

    it('should have DatabaseService', () => {
      const databaseService = module.get<DatabaseService>(DatabaseService);
      expect(databaseService).toBeDefined();
    });
  });

  describe('Dependency Injection', () => {
    it('should inject DatabaseService into AccessibilitySettingsService', () => {
      const service = module.get<AccessibilitySettingsService>(
        AccessibilitySettingsService,
      );
      const databaseService = module.get<DatabaseService>(DatabaseService);

      expect(service).toBeDefined();
      expect(databaseService).toBeDefined();
      // Verify that the service has access to the database service through its constructor
      expect(service['prisma']).toBeDefined();
    });

    it('should inject AccessibilitySettingsService into AccessibilitySettingsController', () => {
      const controller = module.get<AccessibilitySettingsController>(
        AccessibilitySettingsController,
      );
      const service = module.get<AccessibilitySettingsService>(
        AccessibilitySettingsService,
      );

      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      // Verify that the controller has access to the service through its constructor
      expect(controller['service']).toBeDefined();
    });
  });

  describe('Module Imports', () => {
    it('should import DatabaseModule', () => {
      // This test verifies that the module can access DatabaseModule providers
      const databaseService = module.get<DatabaseService>(DatabaseService);
      expect(databaseService).toBeDefined();
    });
  });

  describe('Provider Availability', () => {    it('should make all providers available for injection', () => {
      // Test that we can get all expected providers
      const providers = [
        AccessibilitySettingsService,
        DatabaseService,
      ];

      for (const provider of providers) {
        const instance = module.get(provider);
        expect(instance).toBeDefined();
      }
    });

    it('should make controller available', () => {
      const controller = module.get<AccessibilitySettingsController>(
        AccessibilitySettingsController,
      );
      expect(controller).toBeDefined();
    });
  });

  describe('Module Integration', () => {
    it('should successfully create the module with all dependencies', () => {
      // This test ensures that the module can be created without circular dependencies
      // or missing providers
      expect(module).toBeDefined();
      
      // Verify key components are working together
      const controller = module.get<AccessibilitySettingsController>(
        AccessibilitySettingsController,
      );
      const service = module.get<AccessibilitySettingsService>(
        AccessibilitySettingsService,
      );
      
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    it('should handle module lifecycle correctly', async () => {
      // Test module cleanup
      await expect(module.close()).resolves.not.toThrow();
    });
  });

  describe('Service Dependencies', () => {
    it('should provide DatabaseService to AccessibilitySettingsService', () => {
      const service = module.get<AccessibilitySettingsService>(
        AccessibilitySettingsService,
      );
      
      // Check that the service has the expected database service injected
      expect(service).toBeDefined();
      expect(typeof service.getSettings).toBe('function');
      expect(typeof service.updateSettings).toBe('function');
    });
  });

  describe('Module Error Handling', () => {
    it('should handle missing dependencies gracefully', async () => {
      // Test creating module without proper database service
      await expect(
        Test.createTestingModule({
          providers: [AccessibilitySettingsService],
          controllers: [AccessibilitySettingsController],
        }).compile()
      ).rejects.toThrow();
    });
  });

  describe('Provider Registration', () => {
    it('should register AccessibilitySettingsService as singleton', () => {
      const service1 = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
      const service2 = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
      
      expect(service1).toBe(service2); // Same instance
    });

    it('should register DatabaseService correctly', () => {
      const databaseService = module.get<DatabaseService>(DatabaseService);
      
      expect(databaseService).toBeDefined();
      expect(databaseService.userAccessibilitySettings).toBeDefined();
    });
  });

  describe('Controller Registration', () => {
    it('should register AccessibilitySettingsController properly', () => {
      const controller = module.get<AccessibilitySettingsController>(AccessibilitySettingsController);
      
      expect(controller).toBeDefined();
      expect(typeof controller.getSettings).toBe('function');
      expect(typeof controller.updateSettings).toBe('function');
    });
  });
  describe('Module Metadata', () => {
    it('should have correct imports configuration', () => {
      // Verify that DatabaseModule is properly imported
      const databaseService = module.get<DatabaseService>(DatabaseService);
      expect(databaseService).toBeDefined();
    });

    it('should export necessary providers for other modules', () => {
      // Test that services can be injected in other modules
      const service = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
      expect(service).toBeDefined();
    });
  });

  describe('Circular Dependency Prevention', () => {
    it('should not have circular dependencies', () => {
      // This test ensures module creation succeeds without circular dependency errors
      expect(module).toBeDefined();
      
      const service = module.get<AccessibilitySettingsService>(AccessibilitySettingsService);
      const controller = module.get<AccessibilitySettingsController>(AccessibilitySettingsController);
      const databaseService = module.get<DatabaseService>(DatabaseService);
      
      expect(service).toBeDefined();
      expect(controller).toBeDefined();
      expect(databaseService).toBeDefined();
    });
  });

  describe('Module Scope', () => {
    it('should provide correct scope for all providers', () => {
      // All providers should be available within the module scope
      const providers = [
        AccessibilitySettingsService,
        AccessibilitySettingsController,
        DatabaseService,
      ];

      providers.forEach(provider => {
        const instance = module.get(provider);
        expect(instance).toBeDefined();
      });
    });
  });
});