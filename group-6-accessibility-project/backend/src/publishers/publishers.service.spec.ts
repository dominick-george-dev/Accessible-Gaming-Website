import { Test, TestingModule } from '@nestjs/testing';
import { PublishersService } from './publishers.service';
import { DatabaseService } from '../database/database.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
};

const mockUpdatedUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'PUBLISHER', // ✅ Updated role after creation
};

const mockPublisher = {
  id: 1,
  displayName: 'Test Publisher',
  userId: 1,
  Game: [],
  User: mockUpdatedUser,
};

const mockDatabaseService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  publisher: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  // ✅ Mock the transaction to simulate the actual implementation
  $transaction: jest.fn((callback) => {
    // Simulate the transaction callback execution
    return callback({
      publisher: {
        create: jest.fn().mockResolvedValue(mockPublisher),
      },
      user: {
        update: jest.fn().mockResolvedValue(mockUpdatedUser),
      },
    });
  }),
};

describe('PublishersService', () => {
  let service: PublishersService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<PublishersService>(PublishersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new publisher successfully', async () => {
      const createDto = { userId: 1, displayName: 'Test Publisher' };
      
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.publisher.findFirst.mockResolvedValue(null);

      const result = await service.create(createDto);

      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, username: true, email: true, role: true }
      });

      // ✅ Expect the actual response structure from your service
      expect(result).toEqual({
        message: 'Publisher account created successfully',
        publisher: mockPublisher,
        user: mockUpdatedUser,
      });
    });

    it('should throw BadRequestException for empty display name', async () => {
      const createDto = { userId: 1, displayName: '   ' };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(databaseService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const createDto = { userId: 999, displayName: 'Test Publisher' };
      
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if publisher already exists', async () => {
      const createDto = { userId: 1, displayName: 'Test Publisher' };
      
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.publisher.findFirst.mockResolvedValue(mockPublisher);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all publishers', async () => {
      const publishers = [mockPublisher];
      mockDatabaseService.publisher.findMany.mockResolvedValue(publishers);

      const result = await service.findAll();

      expect(databaseService.publisher.findMany).toHaveBeenCalled();
      expect(result).toEqual(publishers);
    });

    it('should return empty array when no publishers', async () => {
      mockDatabaseService.publisher.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a publisher by id', async () => {
      mockDatabaseService.publisher.findUnique.mockResolvedValue(mockPublisher);

      const result = await service.findOne(1);

      expect(databaseService.publisher.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockPublisher);
    });

    it('should throw NotFoundException for non-existent publisher', async () => {
      mockDatabaseService.publisher.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return publisher by user id', async () => {
      mockDatabaseService.publisher.findFirst.mockResolvedValue(mockPublisher);

      const result = await service.findByUserId(1);

      expect(databaseService.publisher.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockPublisher);
    });

    it('should throw NotFoundException if no publisher found for user', async () => {
      mockDatabaseService.publisher.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId(999)).rejects.toThrow(NotFoundException);
    });
  });
});