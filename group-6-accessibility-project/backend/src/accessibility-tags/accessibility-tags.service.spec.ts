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
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      gameAccessibilityTags: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilityTagsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService
        }
      ],
    }).compile();

    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all accessibility tags', async () => {
      const mockTags = [
        { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
        { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
      ];
      (databaseService.accessibilityTags.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(databaseService.accessibilityTags.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags exist', async () => {
      (databaseService.accessibilityTags.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(databaseService.accessibilityTags.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific accessibility tag', async () => {
      const mockTag = { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time };
      (databaseService.accessibilityTags.findUnique as jest.Mock).mockResolvedValue(mockTag);

      const result = await service.findOne(1);

      expect(databaseService.accessibilityTags.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag not found', async () => {
      (databaseService.accessibilityTags.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(databaseService.accessibilityTags.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAllByGameId', () => {
    it('should return all tags for a specific game', async () => {
      const mockTagLinks = [
        {
          gameId: 1,
          accessibilityTagsId: 1,
          accessibilityTags: { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
        },
        {
          gameId: 1,
          accessibilityTagsId: 2,
          accessibilityTags: { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
        },
      ];
      (databaseService.gameAccessibilityTags.findMany as jest.Mock).mockResolvedValue(mockTagLinks);

      const result = await service.findAllByGameId(1);

      expect(databaseService.gameAccessibilityTags.findMany).toHaveBeenCalledWith({
        where: { gameId: 1 },
        include: { accessibilityTags: true },
      });
      expect(result).toEqual([
        { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
        { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
      ]);
    });

    it('should return empty array when game has no tags', async () => {
      (databaseService.gameAccessibilityTags.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllByGameId(1);

      expect(databaseService.gameAccessibilityTags.findMany).toHaveBeenCalledWith({
        where: { gameId: 1 },
        include: { accessibilityTags: true },
      });
      expect(result).toEqual([]);
    });

    it('should filter out null tags', async () => {
      const mockTagLinks = [
        {
          gameId: 1,
          accessibilityTagsId: 1,
          accessibilityTags: { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
        },
        {
          gameId: 1,
          accessibilityTagsId: 2,
          accessibilityTags: null,
        },
      ];
      (databaseService.gameAccessibilityTags.findMany as jest.Mock).mockResolvedValue(mockTagLinks);

      const result = await service.findAllByGameId(1);

      expect(result).toEqual([
        { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
      ]);
    });
  });

  describe('create', () => {
    it('should create accessibility tag with correct data', async () => {
      const createDto = { tag: 'New Tag', category: 'Visual' };
      const expectedResult = { id: 1, ...createDto, createdAt: time, updatedAt: time };
      
      (databaseService.accessibilityTags.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(databaseService.accessibilityTags.create).toHaveBeenCalledWith({
        data: {
          tag: createDto.tag,
          category: createDto.category,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle create with extra fields by filtering them out', async () => {
      const createDtoWithId = { id: 999, tag: 'New Tag', category: 'Visual' } as any;
      const expectedResult = { id: 1, tag: 'New Tag', category: 'Visual', createdAt: time, updatedAt: time };
      
      (databaseService.accessibilityTags.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.create(createDtoWithId);

      expect(databaseService.accessibilityTags.create).toHaveBeenCalledWith({
        data: {
          tag: 'New Tag',
          category: 'Visual',
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update accessibility tag', async () => {
      const updateDto = { tag: 'Updated Tag', category: 'Audio' };
      const expectedResult = { id: 1, ...updateDto, createdAt: time, updatedAt: time };
      
      (databaseService.accessibilityTags.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(databaseService.accessibilityTags.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          tag: updateDto.tag,
          category: updateDto.category,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update only specified fields', async () => {
      const updateDto = { tag: 'Updated Tag' };
      const expectedResult = { id: 1, tag: 'Updated Tag', category: 'Text', createdAt: time, updatedAt: time };
      
      (databaseService.accessibilityTags.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);

      expect(databaseService.accessibilityTags.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          tag: 'Updated Tag',
          category: undefined,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete accessibility tag and related game links', async () => {
      const expectedResult = { id: 1, tag: 'Deleted Tag', category: 'Text', createdAt: time, updatedAt: time };
      
      (databaseService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          gameAccessibilityTags: {
            deleteMany: jest.fn(),
          },
          accessibilityTags: {
            delete: jest.fn().mockResolvedValue(expectedResult),
          },
        };
        return await callback(mockTx);
      });

      const result = await service.remove(1);

      expect(databaseService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle transaction properly', async () => {
      const mockTx = {
        gameAccessibilityTags: {
          deleteMany: jest.fn(),
        },
        accessibilityTags: {
          delete: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };
      
      (databaseService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await service.remove(1);

      expect(mockTx.gameAccessibilityTags.deleteMany).toHaveBeenCalledWith({
        where: { accessibilityTagsId: 1 },
      });
      expect(mockTx.accessibilityTags.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});