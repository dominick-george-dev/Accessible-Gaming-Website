import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { DatabaseService } from '../database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

const mockDatabaseService = {
  favourites: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  describe('toggleFavorite', () => {
    it('should remove favorite if it exists', async () => {
      mockDatabaseService.favourites.findFirst.mockResolvedValue({ id: 1 });
      mockDatabaseService.favourites.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.toggleFavorite(1, 2);
      expect(mockDatabaseService.favourites.findFirst).toHaveBeenCalledWith({ where: { userId: 1, gameId: 2 } });
      expect(mockDatabaseService.favourites.deleteMany).toHaveBeenCalledWith({ where: { userId: 1, gameId: 2 } });
      expect(result).toEqual({ removed: true, gameId: 2 });
    });

    it('should add favorite if it does not exist', async () => {
      mockDatabaseService.favourites.findFirst.mockResolvedValue(null);
      mockDatabaseService.favourites.create.mockResolvedValue({ id: 1, userId: 1, gameId: 2 });
      const result = await service.toggleFavorite(1, 2);
      expect(mockDatabaseService.favourites.findFirst).toHaveBeenCalledWith({ where: { userId: 1, gameId: 2 } });
      expect(mockDatabaseService.favourites.create).toHaveBeenCalledWith({ data: { userId: 1, gameId: 2 } });
      expect(result).toEqual({ added: true, gameId: 2 });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockDatabaseService.favourites.findFirst.mockRejectedValue(new Error('DB error'));
      await expect(service.toggleFavorite(1, 2)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getFavorites', () => {
    it('should return favorites for a user', async () => {
      const favorites = [{ id: 1, userId: 1, gameId: 2 }];
      mockDatabaseService.favourites.findMany.mockResolvedValue(favorites);
      const result = await service.getFavorites(1);
      expect(mockDatabaseService.favourites.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toBe(favorites);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockDatabaseService.favourites.findMany.mockRejectedValue(new Error('DB error'));
      await expect(service.getFavorites(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
