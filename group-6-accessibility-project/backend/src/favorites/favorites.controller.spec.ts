import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: FavoritesService;

  // Mock implementation of FavoritesService
  const mockFavoritesService = {
    getFavorites: jest.fn(),
    toggleFavorite: jest.fn(),
  };

  beforeEach(async () => {
    // Create a testing module that includes the controller
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: mockFavoritesService, // Use mocked service instead of real one
        },
      ],
    })
      // Override the ThrottlerGuard since rate limiting would interfere with tests
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Always allow activation
      })
      .compile();

    // Retrieve controller and service instances from the module
    controller = module.get<FavoritesController>(FavoritesController);
    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    // Basic sanity check
    expect(controller).toBeDefined();
  });

  describe('getFavorites', () => {
    it('should call favoritesService.getFavorites with numeric userId', async () => {
      // Arrange: Mock return value
      mockFavoritesService.getFavorites.mockResolvedValue(['game1', 'game2']);

      // Act: Call the controller method with string userId
      const result = await controller.getFavorites('5');

      // Assert: Ensure the service was called with a number
      expect(service.getFavorites).toHaveBeenCalledWith(5);
      expect(result).toEqual(['game1', 'game2']);
    });
  });

  describe('toggleFavorite', () => {
    it('should call favoritesService.toggleFavorite with correct arguments', async () => {
      const body = { userId: 1, gameId: 10 };

      // Arrange: Mock return value
      mockFavoritesService.toggleFavorite.mockResolvedValue({ success: true });

      // Act: Call the controller method
      const result = await controller.toggleFavorite(body);

      // Assert: Ensure service was called with correct parameters
      expect(service.toggleFavorite).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({ success: true });
    });
  });
});
