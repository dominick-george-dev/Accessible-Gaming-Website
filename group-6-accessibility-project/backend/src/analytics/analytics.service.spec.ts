import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

// Utility to build a fresh DB mock each time
function createMockDB() {
  return {
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
}


// MAIN ANALYTICS TEST SUITE
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let db: ReturnType<typeof createMockDB>;

  beforeEach(async () => {
    jest.resetAllMocks();

    db = createMockDB();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: db }
      ]
    }).compile();

    service = module.get(AnalyticsService);
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

    const result = await service.getPublisherAnalytics(publisherId);

    expect(result.games[0].dailyViews).toEqual([
      { date: "2025-01-01", count: 1 },
      { date: "2025-01-02", count: 1 },
      { date: "2025-01-03", count: 1 },
    ]);
  });

  it('should throw InternalServerErrorException for db failures', async () => {
    db.game.count.mockRejectedValue(new Error('DB error'));

    await expect(service.getPublisherAnalytics(publisherId))
      .rejects.toThrow(InternalServerErrorException);
  });
});


// SECURITY & SANITISATION TESTS
describe("AnalyticsService Security & Sanitization", () => {
  let service: AnalyticsService;
  let db: ReturnType<typeof createMockDB>;

  beforeEach(async () => {
    jest.resetAllMocks();
    db = createMockDB();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: db }
      ]
    }).compile();

    service = module.get(AnalyticsService);
  });

  function mockDefaults() {
    db.game.count.mockResolvedValue(1);
    db.review.aggregate.mockResolvedValue({ _avg: { rating: 5 } });
    db.view.groupBy.mockResolvedValue([]);
    db.review.groupBy.mockResolvedValue([]);
    db.gameAccessibilityTags.findMany.mockResolvedValue([]);
    db.game.findMany.mockResolvedValue([
      {
        id: 1,
        title: "<script>alert('xss')</script>",
        _count: { views: 1, reviews: 1 },
        reviews: [{ rating: 5 }]
      }
    ]);
    db.view.findMany.mockResolvedValue([
      { gameId: 1, viewedAt: new Date("2025-01-01") }
    ]);
  }

  // Should protect from XSS in game titles
  it("should escape XSS in game titles", async () => {
    mockDefaults();

    const result = await service.getPublisherAnalytics(1);

    expect(result.games[0].title)
      .toBe("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
  });

  // Sanitize accessibility categories
  it("should sanitize accessibility categories", async () => {
    mockDefaults();
    db.gameAccessibilityTags.findMany.mockResolvedValue([
      { accessibilityTags: { category: "<b>boom</b>" } }
    ]);

    const result = await service.getPublisherAnalytics(1);

    expect(result.accessibilityFeatureDistribution[0].category)
      .toBe("&lt;b&gt;boom&lt;/b&gt;");
  });

  //Should protect publisherId from script injection
  it("should reject non-numeric publisherId", async () => {
    await expect(service.getPublisherAnalytics("bad" as any))
      .rejects.toThrow(BadRequestException);
  });

  // Identifies Not a Numbers
  it("should reject NaN", async () => {
    await expect(service.getPublisherAnalytics(NaN as any))
      .rejects.toThrow(BadRequestException);
  });

  // Reject Objects as publisher Id
  it("should reject object publisherId (pollution attempt)", async () => {
    const malicious = { __proto__: { hacked: true } };

    await expect(service.getPublisherAnalytics(malicious as any))
      .rejects.toThrow(BadRequestException);

    expect(({} as any).hacked).toBeUndefined();
  });

  // Stop DB call for invalid input
  it("should NOT call DB when input invalid", async () => {
    await expect(service.getPublisherAnalytics("xx" as any))
      .rejects.toThrow(BadRequestException);

    expect(db.game.count).not.toHaveBeenCalled();
    expect(db.game.findMany).not.toHaveBeenCalled();
  });

  // Should respond with InternalServerErrorException errors
  it("should wrap db errors into InternalServerErrorException", async () => {
    db.game.count.mockRejectedValue(new Error("DB FAIL"));

    await expect(service.getPublisherAnalytics(1))
      .rejects.toThrow(InternalServerErrorException);
  });
});
