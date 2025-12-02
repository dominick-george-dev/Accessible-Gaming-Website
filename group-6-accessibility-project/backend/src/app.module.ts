import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccessibilityIssuesModule } from './accessibility-issues/accessibility-issues.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppService } from './app.service';
import { PublishersModule } from './publishers/publishers.module';
import { UploadModule } from './upload/upload.module';
import { AwsService } from './services/aws/aws.service';
import { FavoritesModule } from './favorites/favorites.module';


@Module({
  imports: [
  GamesModule,
  DatabaseModule,
  AccessibilityTagsModule,
  ReviewsModule,
  UsersModule,
  AuthModule,
  AnalyticsModule,
  PublishersModule,
  UploadModule,
  FavoritesModule, 
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 1000,
          ttl: 60000,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AwsService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
