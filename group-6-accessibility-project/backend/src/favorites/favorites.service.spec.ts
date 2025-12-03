import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { DatabaseService } from '../database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;

  // Correct mock with deleteMany instead of delete
  const mockDatabaseService = {
    favourites: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),   // ✅ FIXED
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  // ------------------------------------------------------
  // toggleFavorite Tests
  // ------------------------------------------------------
  describe('toggleFavorite', () => {
    it('should remove an existing favorite', async () => {
      // Mock: favorite exists
      mockDatabaseService.favourites.findFirst.mockResolvedValue({
        id: 1,
        userId: 10,
        gameId: 20,
      });

      mockDatabaseService.favourites.deleteMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.toggleFavorite(10, 20);

      // Expect deleteMany to be called correctly
      expect(mockDatabaseService.favourites.deleteMany).toHaveBeenCalledWith({
        where: { userId: 10, gameId: 20 },
      });

      expect(result).toEqual({ removed: true, gameId: 20 });
    });

    it('should add a new favorite if none exists', async () => {
      // Mock: no favorite present
      mockDatabaseService.favourites.findFirst.mockResolvedValue(null);

      mockDatabaseService.favourites.create.mockResolvedValue({
        id: 99,
        userId: 10,
        gameId: 20,
      });

      const result = await service.toggleFavorite(10, 20);

      expect(mockDatabaseService.favourites.create).toHaveBeenCalledWith({
        data: { userId: 10, gameId: 20 },
      });

      expect(result).toEqual({ added: true, gameId: 20 });
    });

    it('should throw InternalServerErrorException on database error', async () => {
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

      mockDatabaseService.favourites.findMany.mockResolvedValue(
        mockFavorites,
      );

      const result = await service.getFavorites(10);

      expect(result).toEqual(mockFavorites);

      expect(mockDatabaseService.favourites.findMany).toHaveBeenCalledWith({
        where: { userId: 10 },
      });
    });

    it('should throw InternalServerErrorException when database fails', async () => {
      mockDatabaseService.favourites.findMany.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getFavorites(10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
