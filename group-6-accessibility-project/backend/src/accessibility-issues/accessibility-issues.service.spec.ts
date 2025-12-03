import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityIssuesService } from './accessibility-issues.service';
import { DatabaseService } from '../database/database.service';

describe('AccessibilityIssuesService - resolveIssue', () => {
  let service: AccessibilityIssuesService;

  const mockDatabaseService = {
    accessibilityIssues: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls accessibilityIssues.delete with correct where object and returns deleted record', async () => {
    const deleted = { id: 42, userId: 5, message: 'fixed', createdAt: new Date() };
    mockDatabaseService.accessibilityIssues.delete.mockResolvedValue(deleted);

    const result = await service.resolveIssue(42);

    expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledTimes(1);
    expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
      where: { id: 42 },
    });
    expect(result).toBe(deleted);
  });

  it('propagates errors thrown by database.delete', async () => {
    const error = new Error('DB failure');
    mockDatabaseService.accessibilityIssues.delete.mockRejectedValue(error);

    await expect(service.resolveIssue(1)).rejects.toThrow('DB failure');
    expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("does not call other database methods when resolving an issue", async () => {
    const deleted = { id: 7 };
    mockDatabaseService.accessibilityIssues.delete.mockResolvedValue(deleted);

    const result = await service.resolveIssue(7);

    expect(result).toBe(deleted);
    expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledTimes(1);
    expect(mockDatabaseService.accessibilityIssues.create).not.toHaveBeenCalled();
    expect(mockDatabaseService.accessibilityIssues.findMany).not.toHaveBeenCalled();
  });

  it('forwards non-integer/NaN ids unchanged to database.delete', async () => {
    const sentinel = { id: NaN };
    mockDatabaseService.accessibilityIssues.delete.mockResolvedValue(sentinel);

    const result = await service.resolveIssue(NaN);

    expect(mockDatabaseService.accessibilityIssues.delete).toHaveBeenCalledWith({
      where: { id: NaN },
    });
    expect(result).toBe(sentinel);
  });
});