import { Controller, Get, Param, ParseIntPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('game/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Throttle({default: { limit: 5, ttl: 60000 }}) // Limit to 5 requests per minute per user
  getAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getAllGameAnalytics(id);
  }
}
