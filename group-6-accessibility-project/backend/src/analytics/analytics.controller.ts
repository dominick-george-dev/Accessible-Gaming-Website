import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('publisher')
  @Roles('ADMIN', 'PUBLISHER')
  getPublisherAnalytics(@Req() req: any) {
    const publisherId = req.user.userId;
    return this.analyticsService.getPublisherAnalytics(publisherId);
  }
}
