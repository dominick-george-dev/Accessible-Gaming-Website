import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('game/:id')
  async getAnalyticsForGame(
    @Param('id', ParseIntPipe) gameId: number,
  ) {
    return this.analyticsService.getGameAnalytics(gameId);
  }
}
