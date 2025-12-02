import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { DatabaseService } from '../database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;

  // Mock database methods used in the service
  const mockDatabaseService = {
    favourites: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    // Create a testing module with mocked DatabaseService
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService, // inject mocked database service
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  // ------------------------------------------------------
  // toggleFavorite Tests
  // ------------------------------------------------------
  describe('toggleFavorite', () => {
    it('should remove an existing favorite', async () => {
      // Mock: favorite already exists
      mockDatabaseService.favourites.findFirst.mockResolvedValue({
        id: 1,
        userId: 10,
        gameId: 20,
      });

      const result = await service.toggleFavorite(10, 20);

      // Ensure delete was called with correct id
      expect(mockDatabaseService.favourites.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      // Expect returned value indicating removal
      expect(result).toEqual({ removed: true, gameId: 20 });
    });

    it('should add a new favorite if none exists', async () => {
      // Mock: no existing favorite
      mockDatabaseService.favourites.findFirst.mockResolvedValue(null);

      const result = await service.toggleFavorite(10, 20);

      // Ensure create was called with correct data
      expect(mockDatabaseService.favourites.create).toHaveBeenCalledWith({
        data: { userId: 10, gameId: 20 },
      });

      // Expect returned value indicating addition
      expect(result).toEqual({ added: true, gameId: 20 });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Mock: database throws error
      mockDatabaseService.favourites.findFirst.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.toggleFavorite(10, 20)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ------------------------------------------------------
  // getFavorites Tests
  // ------------------------------------------------------
  describe('getFavorites', () => {
    it('should return a list of favorites', async () => {
      const mockFavorites = [
        { id: 1, userId: 10, gameId: 100 },
        { id: 2, userId: 10, gameId: 200 },
      ];

      // Mock: findMany returns favorite list
      mockDatabaseService.favourites.findMany.mockResolvedValue(mockFavorites);

      const result = await service.getFavorites(10);

      expect(result).toEqual(mockFavorites);

      expect(mockDatabaseService.favourites.findMany).toHaveBeenCalledWith({
        where: { userId: 10 },
      });
    });

    it('should throw InternalServerErrorException when database fails', async () => {
      // Mock: database throws error
      mockDatabaseService.favourites.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getFavorites(10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
