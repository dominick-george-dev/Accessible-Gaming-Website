import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics/analytics.controller';
import { AnalyticsService } from '../analytics/analytics.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const mockService = {
      getPublisherAnalytics: jest.fn().mockResolvedValue({ ok: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
      ],
    })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get(AnalyticsController);
    service = module.get(AnalyticsService);
  });

  it('should fetch analytics', async () => {
    await controller.getGamesAnalytics(1);
    expect(service.getPublisherAnalytics).toHaveBeenCalledWith(1);
  });
});
