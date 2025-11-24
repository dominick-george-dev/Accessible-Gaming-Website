import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockDB = {
    game: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    view: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    gameAccessibilityTags: {
      findMany: jest.fn(),
    }
  };

  // This ensures TypeScript understands everything as Jest mocks
  let db: jest.Mocked<typeof mockDB>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: DatabaseService,
          useValue: mockDB,
        }
      ]
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    db = module.get(DatabaseService);
  });

  const publisherId = 10;

  //Dummy Data
  const mockGames = [
    {
      id: 1,
      title: "Game A",
      publisherId,
      _count: { views: 5, reviews: 2 },
      reviews: [{ rating: 4 }, { rating: 2 }],
    },
    {
      id: 2,
      title: "Game B",
      publisherId,
      _count: { views: 3, reviews: 1 },
      reviews: [{ rating: 5 }],
    }
  ];

  const mockDailyViews = [
    { gameId: 1, viewedAt: new Date("2025-01-01") },
    { gameId: 1, viewedAt: new Date("2025-01-01") },
    { gameId: 1, viewedAt: new Date("2025-01-02") },
    { gameId: 2, viewedAt: new Date("2025-01-01") },
  ];

  const mockAccessibility = [
    { accessibilityTags: { category: "vision" } },
    { accessibilityTags: { category: "hearing" } },
    { accessibilityTags: { category: "vision" } },
  ];

  const mockTopViewed = [
    { gameId: 1, _count: { gameId: 50 } },
    { gameId: 2, _count: { gameId: 40 } },
  ];

  const mockTopRated = [
    { gameId: 2, _avg: { rating: 4.8 } },
    { gameId: 1, _avg: { rating: 3.0 } },
  ];

  const mockAvgRating = { _avg: { rating: 3.6 } };

  function mockAllDB() {
    db.game.count.mockResolvedValue(2);
    db.review.aggregate.mockResolvedValue(mockAvgRating);
    db.view.groupBy.mockResolvedValue(mockTopViewed); 
    db.review.groupBy.mockResolvedValue(mockTopRated); 
    db.gameAccessibilityTags.findMany.mockResolvedValue(mockAccessibility);
    db.game.findMany.mockResolvedValue(mockGames);
    db.view.findMany.mockResolvedValue(mockDailyViews); 
  }

  // Returns analytics
  it('should return full analytics response', async () => {
    mockAllDB();

    const result = await service.getPublisherAnalytics(publisherId);

    // Root fields 
    expect(result.totalGames).toBe(2);
    expect(result.avgTotalRating).toBe(3.6);

    // Top viewed
    expect(result.topViewedGames).toHaveLength(2);
    expect(result.topViewedGames[0]).toEqual(mockTopViewed[0]);

    // --- Top rated ---
    expect(result.topRatedGames).toEqual([
      { gameId: 2, avgRating: 4.8 },
      { gameId: 1, avgRating: 3.0 },
    ]);

    // Accessibility distribution 
    expect(result.accessibilityFeatureDistribution).toEqual([
      { category: "vision", count: 2 },
      { category: "hearing", count: 1 },
    ]);

    // Game-level analytics
    expect(result.games).toHaveLength(2);

    const gameA = result.games[0];
    expect(gameA.gameId).toBe(1);
    expect(gameA.avgRating).toBe(3.0); // (4 + 2) / 2
    expect(gameA.totalViews).toBe(5);
    expect(gameA.totalReviews).toBe(2);

    // Daily views aggregated correctly
    expect(gameA.dailyViews).toEqual([
      { date: "2025-01-01", count: 2 },
      { date: "2025-01-02", count: 1 },
    ]);

    const gameB = result.games[1];
    expect(gameB.dailyViews).toEqual([
      { date: "2025-01-01", count: 1 }
    ]);
  });

  // Empty datasets still return valid structure
  it('should handle empty analytics gracefully', async () => {
    db.game.count.mockResolvedValue(0);
    db.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
    db.view.groupBy.mockResolvedValue([]);
    db.review.groupBy.mockResolvedValue([]);
    db.gameAccessibilityTags.findMany.mockResolvedValue([]);
    db.game.findMany.mockResolvedValue([]);
    db.view.findMany.mockResolvedValue([]);

    const res = await service.getPublisherAnalytics(publisherId);

    expect(res.totalGames).toBe(0);
    expect(res.avgTotalRating).toBe(0);
    expect(res.topViewedGames).toEqual([]);
    expect(res.topRatedGames).toEqual([]);
    expect(res.accessibilityFeatureDistribution).toEqual([]);
    expect(res.games).toEqual([]);
  });

  // Proper rounding of ratings
  it('should round ratings to 1 decimal place', async () => {
    mockAllDB();
    mockGames[0].reviews = [{ rating: 3.3333 }, { rating: 3.3333 }];

    const res = await service.getPublisherAnalytics(publisherId);

    const gameA = res.games.find(g => g.gameId === 1);
    expect(gameA?.avgRating).toBe(3.3);
  });

//Daily Views Test
  it('should sort daily views by date', async () => {
    mockAllDB();

    // Out-of-order input
    db.view.findMany.mockResolvedValue([
      { gameId: 1, viewedAt: new Date("2025-01-03") },
      { gameId: 1, viewedAt: new Date("2025-01-01") },
      { gameId: 1, viewedAt: new Date("2025-01-02") },
    ]);

    const res = await service.getPublisherAnalytics(publisherId);
    const daily = res.games[0].dailyViews;

    expect(daily).toEqual([
      { date: "2025-01-01", count: 1 },
      { date: "2025-01-02", count: 1 },
      { date: "2025-01-03", count: 1 },
    ]);
  });


// Accessibility categories are counted correctly
  it('should aggregate accessibility categories correctly', async () => {
    mockAllDB();

    const res = await service.getPublisherAnalytics(publisherId);

    expect(res.accessibilityFeatureDistribution).toContainEqual({
      category: "vision",
      count: 2,
    });
    expect(res.accessibilityFeatureDistribution).toContainEqual({
      category: "hearing",
      count: 1,
    });
  });

  // DB failure throws InternalServerErrorException
  it('should throw InternalServerErrorException when DB fails', async () => {
    db.game.count.mockRejectedValue(new Error('DB error'));

    await expect(service.getPublisherAnalytics(publisherId)).rejects.toThrow(
      InternalServerErrorException
    );
  });
});
