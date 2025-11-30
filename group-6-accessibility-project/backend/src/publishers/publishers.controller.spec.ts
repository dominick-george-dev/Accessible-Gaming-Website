import { Test, TestingModule } from '@nestjs/testing';
import { PublishersController } from './publishers.controller';
import { PublishersService } from './publishers.service';
import { DatabaseService } from '../database/database.service';

// Mock data
const mockPublisher = {
  id: 1,
  displayName: 'Test Publisher',
  userId: 1,
  Game: [],
  User: {
    username: 'testuser',
    email: 'test@example.com',
    role: 'PUBLISHER'
  }
};

// Mock services
const mockPublishersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByUserId: jest.fn(),
};

const mockDatabaseService = {
  publisher: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('PublishersController', () => {
  let controller: PublishersController;
  let service: PublishersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishersController],
      providers: [
        {
          provide: PublishersService,
          useValue: mockPublishersService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<PublishersController>(PublishersController);
    service = module.get<PublishersService>(PublishersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new publisher', async () => {
      const createDto = { userId: 1, displayName: 'Test Publisher' };
      mockPublishersService.create.mockResolvedValue(mockPublisher);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPublisher);
    });

    it('should handle creation errors', async () => {
      const createDto = { userId: 1, displayName: 'Test Publisher' };
      mockPublishersService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createDto)).rejects.toThrow('Creation failed');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all publishers', async () => {
      const publishers = [mockPublisher];
      mockPublishersService.findAll.mockResolvedValue(publishers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(publishers);
    });

    it('should return empty array when no publishers exist', async () => {
      mockPublishersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a publisher by id', async () => {
      mockPublishersService.findOne.mockResolvedValue(mockPublisher);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPublisher);
    });

    it('should handle non-existent publisher', async () => {
      mockPublishersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should convert string id to number', async () => {
      mockPublishersService.findOne.mockResolvedValue(mockPublisher);

      await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('findByUserId', () => {
    it('should return publisher by user id', async () => {
      mockPublishersService.findByUserId.mockResolvedValue(mockPublisher);

      const result = await controller.findByUserId('1');

      expect(service.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPublisher);
    });

    it('should handle non-existent user', async () => {
      mockPublishersService.findByUserId.mockResolvedValue(null);

      const result = await controller.findByUserId('999');

      expect(service.findByUserId).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should convert string userId to number', async () => {
      mockPublishersService.findByUserId.mockResolvedValue(mockPublisher);

      await controller.findByUserId('456');

      expect(service.findByUserId).toHaveBeenCalledWith(456);
    });
  });
});