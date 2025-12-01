import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('publisher')
  @Roles('ADMIN', 'PUBLISHER')
  getPublisherAnalytics(@Req() req: any) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return this.analyticsService.getPublisherAnalytics(userId);
  }
}
