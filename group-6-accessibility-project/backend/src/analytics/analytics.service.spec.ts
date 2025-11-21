import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics/analytics.service';
import { DatabaseService } from '../database/database.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let db: DatabaseService;

  beforeEach(async () => {
    const mockDB = {
      view: { count: jest.fn() },
      review: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: mockDB },
      ],
    }).compile();

    service = module.get(AnalyticsService);
    db = module.get(DatabaseService);
  });

  it('should return analytics', async () => {
    (db.view.count as jest.Mock).mockResolvedValue(100);
    (db.review.count as jest.Mock).mockResolvedValue(20);
    (db.review.aggregate as jest.Mock).mockResolvedValue({ _avg: { rating: 4.5 } });
    (db.$queryRaw as jest.Mock).mockResolvedValue([{ date: '2025-01-01', count: 10 }]);


    const result = await service.getAllGameAnalytics(1);

    expect(result).toEqual({
      totalViews: 100,
      totalReviews: 20,
      averageRating: 4.5,
      dailyViews: [{ date: '2025-01-01', count: 10 }],
    });
  });
});
