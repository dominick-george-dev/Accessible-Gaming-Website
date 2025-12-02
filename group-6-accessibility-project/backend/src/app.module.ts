import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AccessibilitySettingsModule } from './accessibility-settings/accessibility_settings.module';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccessibilityIssuesModule } from './accessibility-issues/accessibility-issues.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppService } from './app.service';
import { PublishersModule } from './publishers/publishers.module';
import { UploadModule } from './upload/upload.module';
import { UploadController } from './api/upload/upload.controller';
import { AwsService } from './services/aws/aws.service';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilitySettingsModule, AccessibilityTagsModule, AccessibilityIssuesModule, ReviewsModule, UsersModule, AuthModule, AnalyticsModule, PublishersModule, UploadModule, 
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 10,
          ttl: 60000,
        },
      ],
    }),
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, AwsService, {
    provide: 'APP_GUARD',
    useClass: ThrottlerGuard,
  }],
})
export class AppModule {}
