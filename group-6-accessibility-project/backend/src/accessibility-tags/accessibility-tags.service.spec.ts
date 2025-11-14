import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { DatabaseService } from '../database/database.service';

describe('AccessibilityTagsService', () => {
  let service: AccessibilityTagsService;
  let databaseService: DatabaseService;
  let time = new Date();

  beforeEach(async () => {
    const mockDatabaseService = {
      accessibilityTags: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessibilityTagsService, {
        provide: DatabaseService,
        useValue: mockDatabaseService
      }],
    }).compile();

    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all accessibility tags', async () => {
    const mockTags = [
      { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
      { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
    ];
    (databaseService.accessibilityTags.findMany as jest.Mock).mockResolvedValue(mockTags);

    const result = await service.findAll();

    expect(databaseService.accessibilityTags.findMany).toHaveBeenCalledWith();
    expect(result).toEqual(mockTags);
  });
});
