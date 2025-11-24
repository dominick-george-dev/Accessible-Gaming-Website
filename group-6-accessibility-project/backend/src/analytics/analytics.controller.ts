import { Controller, Get, Param, ParseIntPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Get all publisher Analytics in one call
  @Get('publisher/:id')
  getGamesAnalytics(@Param('id', ParseIntPipe) id: number){
    return this.analyticsService.getPublisherAnalytics(id);
  }
}
