import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityIssuesService } from './accessibility-issues.service';
import { DatabaseService } from '../database/database.service';

describe('AccessibilityIssuesService', () => {
  let service: AccessibilityIssuesService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    accessibilityIssues: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilityIssuesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AccessibilityIssuesService>(AccessibilityIssuesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleReportIssue', () => {
    it('should create an accessibility issue successfully', async () => {
      const issueData = { userId: 1, message: 'Navigation is difficult' };
      const mockCreatedIssue = {
        id: 1,
        userId: 1,
        message: 'Navigation is difficult',
        createdAt: new Date(),
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockDatabaseService.accessibilityIssues.create.mockResolvedValue(mockCreatedIssue);

      const result = await service.handleReportIssue(issueData);

      expect(consoleSpy).toHaveBeenCalledWith('Submitted!');
      expect(mockDatabaseService.accessibilityIssues.create).toHaveBeenCalledWith({
        data: {
          userId: issueData.userId,
          message: issueData.message,
        },
      });
      expect(result).toEqual(mockCreatedIssue);

      consoleSpy.mockRestore();
    });

    it('should handle database errors during issue creation', async () => {
      const issueData = { userId: 1, message: 'Screen reader not working' };
      const error = new Error('Database connection failed');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockDatabaseService.accessibilityIssues.create.mockRejectedValue(error);

      await expect(service.handleReportIssue(issueData)).rejects.toThrow('Database connection failed');

      expect(consoleSpy).toHaveBeenCalledWith('Submitted!');
      expect(mockDatabaseService.accessibilityIssues.create).toHaveBeenCalledWith({
        data: {
          userId: issueData.userId,
          message: issueData.message,
        },
      });

      consoleSpy.mockRestore();
    });

    it('should handle empty message', async () => {
      const issueData = { userId: 2, message: '' };
      const mockCreatedIssue = {
        id: 2,
        userId: 2,
        message: '',
        createdAt: new Date(),
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockDatabaseService.accessibilityIssues.create.mockResolvedValue(mockCreatedIssue);

      const result = await service.handleReportIssue(issueData);

      expect(result).toEqual(mockCreatedIssue);
      consoleSpy.mockRestore();
    });
  });

  describe('findAll', () => {
    it('should return all issues with user data successfully', async () => {
      const mockIssuesWithUsers = [
        {
          id: 1,
          userId: 1,
          message: 'Cannot access menu',
          createdAt: new Date(),
          user: { id: 1, email: 'user1@test.com', name: 'User One' },
        },
        {
          id: 2,
          userId: 2,
          message: 'Font too small',
          createdAt: new Date(),
          user: { id: 2, email: 'user2@test.com', name: 'User Two' },
        },
      ];

      mockDatabaseService.accessibilityIssues.findMany.mockResolvedValueOnce(mockIssuesWithUsers);

      const result = await service.findAll();

      expect(mockDatabaseService.accessibilityIssues.findMany).toHaveBeenCalledWith({
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockIssuesWithUsers);
    });

    it('should fallback to issues without user data when include fails', async () => {
      const mockIssuesWithoutUsers = [
        {
          id: 1,
          userId: 1,
          message: 'Cannot access menu',
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          message: 'Font too small',
          createdAt: new Date(),
        },
      ];

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const findManyError = new Error('User relation not found');

      // First call fails (with include), second call succeeds (without include)
      mockDatabaseService.accessibilityIssues.findMany
        .mockRejectedValueOnce(findManyError)
        .mockResolvedValueOnce(mockIssuesWithoutUsers);

      const result = await service.findAll();

      expect(consoleErrorSpy).toHaveBeenCalledWith('findAll error:', findManyError);
      expect(mockDatabaseService.accessibilityIssues.findMany).toHaveBeenCalledTimes(2);
      expect(mockDatabaseService.accessibilityIssues.findMany).toHaveBeenNthCalledWith(1, {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(mockDatabaseService.accessibilityIssues.findMany).toHaveBeenNthCalledWith(2, {
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockIssuesWithoutUsers);

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty results', async () => {
      mockDatabaseService.accessibilityIssues.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle fallback query errors', async () => {
      const firstError = new Error('User relation error');
      const secondError = new Error('Database connection lost');

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockDatabaseService.accessibilityIssues.findMany
        .mockRejectedValueOnce(firstError)
        .mockRejectedValueOnce(secondError);

      await expect(service.findAll()).rejects.toThrow('Database connection lost');

      expect(consoleErrorSpy).toHaveBeenCalledWith('findAll error:', firstError);
      expect(mockDatabaseService.accessibilityIssues.findMany).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('resolveIssue', () => {
    it('should delete an issue successfully', async () => {
      const issueId = 1;
      const mockDeletedIssue = {
        id: 1,
        userId: 1,
        message: 'Navigation issue',
        createdAt: new Date(),
      };

      mockDatabaseService.accessibilityIssues.delete.mockResolvedValue(mockDeletedIssue);

      const result = await service.resolveIssue(issueId);

      expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
        where: { id: issueId },
      });
      expect(result).toEqual(mockDeletedIssue);
    });

    it('should handle deletion of non-existent issue', async () => {
      const nonExistentId = 999;
      const error = new Error('Record not found');

      mockDatabaseService.accessibilityIssues.delete.mockRejectedValue(error);

      await expect(service.resolveIssue(nonExistentId)).rejects.toThrow('Record not found');

      expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });

    it('should handle database errors during deletion', async () => {
      const issueId = 1;
      const error = new Error('Foreign key constraint failed');

      mockDatabaseService.accessibilityIssues.delete.mockRejectedValue(error);

      await expect(service.resolveIssue(issueId)).rejects.toThrow('Foreign key constraint failed');
    });

    it('should handle zero and negative IDs', async () => {
      const zeroId = 0;
      const negativeId = -1;

      mockDatabaseService.accessibilityIssues.delete.mockResolvedValue({ id: zeroId });

      await service.resolveIssue(zeroId);
      await service.resolveIssue(negativeId);

      expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
        where: { id: zeroId },
      });
      expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
        where: { id: negativeId },
      });
    });
  });

  describe('Service Integration', () => {
    it('should have all required methods', () => {
      expect(typeof service.handleReportIssue).toBe('function');
      expect(typeof service.findAll).toBe('function');
      expect(typeof service.resolveIssue).toBe('function');
    });

    it('should properly inject DatabaseService', () => {
      expect(service['databaseService']).toBeDefined();
      expect(service['databaseService']).toBe(databaseService);
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(1000);
      const issueData = { userId: 1, message: longMessage };
      const mockCreatedIssue = {
        id: 1,
        userId: 1,
        message: longMessage,
        createdAt: new Date(),
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockDatabaseService.accessibilityIssues.create.mockResolvedValue(mockCreatedIssue);

      const result = await service.handleReportIssue(issueData);

      expect(result.message).toBe(longMessage);
      consoleSpy.mockRestore();
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = 'Issue with émojis 🎯 and symbols @#$%';
      const issueData = { userId: 1, message: specialMessage };
      const mockCreatedIssue = {
        id: 1,
        userId: 1,
        message: specialMessage,
        createdAt: new Date(),
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockDatabaseService.accessibilityIssues.create.mockResolvedValue(mockCreatedIssue);

      const result = await service.handleReportIssue(issueData);

      expect(result.message).toBe(specialMessage);
      consoleSpy.mockRestore();
    });
  });
});