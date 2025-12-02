import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityTagsController } from './accessibility-tags.controller';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('AccessibilityTagsController', () => {
  let controller: AccessibilityTagsController;
  let service: AccessibilityTagsService;
  let time = new Date();

  beforeEach(async () => {
    const mockAccessibilityTagsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAllByGameId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 10,
        }]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AccessibilityTagsController],
      providers: [
        {
          provide: AccessibilityTagsService,
          useValue: mockAccessibilityTagsService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AccessibilityTagsController>(AccessibilityTagsController);
    service = module.get<AccessibilityTagsService>(AccessibilityTagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all accessibility tags', async () => {
      const mockTags = [
        { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
        { id: 2, tag: 'Colorblind Friendly', category: 'Visual', updatedAt: time, createdAt: time },
      ];
      (service.findAll as jest.Mock).mockResolvedValue(mockTags);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags exist', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific accessibility tag', async () => {
      const mockTag = { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time };
      (service.findOne as jest.Mock).mockResolvedValue(mockTag);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('findAllByGameId', () => {
    it('should return all tags for a specific game', async () => {
      const mockTags = [
        { id: 1, tag: 'Easy to Read', category: 'Text', updatedAt: time, createdAt: time },
      ];
      (service.findAllByGameId as jest.Mock).mockResolvedValue(mockTags);

      const result = await controller.findAllByGameId(1);

      expect(service.findAllByGameId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when game has no tags', async () => {
      (service.findAllByGameId as jest.Mock).mockResolvedValue([]);

      const result = await controller.findAllByGameId(1);

      expect(service.findAllByGameId).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new accessibility tag', async () => {
      const createDto = { tag: 'New Tag', category: 'Visual' };
      const mockResult = { id: 1, ...createDto, createdAt: time, updatedAt: time };
      (service.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update an accessibility tag', async () => {
      const updateDto = { tag: 'Updated Tag', category: 'Audio' };
      const mockResult = { id: 1, ...updateDto, createdAt: time, updatedAt: time };
      (service.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockResult);
    });

    it('should update only specified fields', async () => {
      const updateDto = { tag: 'Updated Tag' };
      const mockResult = { id: 1, tag: 'Updated Tag', category: 'Text', createdAt: time, updatedAt: time };
      (service.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should delete an accessibility tag', async () => {
      const mockResult = { id: 1, tag: 'Deleted Tag', category: 'Text', createdAt: time, updatedAt: time };
      (service.remove as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });
});