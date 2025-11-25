import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics/analytics.controller';
import { AnalyticsService } from '../analytics/analytics.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BadRequestException } from '@nestjs/common';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });  

  it('should fetch analytics', async () => {
    await controller.getPublisherAnalytics({ user: { userId: 1 } });
    expect(service.getPublisherAnalytics).toHaveBeenCalledWith(1);
  });

   it('should return analytics data from the service', async () => {
    const mockAnalytics = { games: [], topViewedGames: [], topRatedGames: [] };
    (service.getPublisherAnalytics as jest.Mock).mockResolvedValueOnce(mockAnalytics);

    const result = await controller.getPublisherAnalytics({ user: { userId: 2 } });
    expect(result).toBe(mockAnalytics);
    expect(service.getPublisherAnalytics).toHaveBeenCalledWith(2);
  });

  it('should call service with correct userId type (number)', async () => {
    await controller.getPublisherAnalytics({ user: { userId: '5' } });
    expect(service.getPublisherAnalytics).toHaveBeenCalledWith('5');
  });
});
