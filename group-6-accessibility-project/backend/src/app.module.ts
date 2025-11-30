import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccessibilityIssuesModule } from './accessibility-issues/accessibility-issues.module';

@Module({
  imports: [GamesModule, DatabaseModule, AccessibilityTagsModule, ReviewsModule, UsersModule, AuthModule, AccessibilityIssuesModule],
  controllers: [AppController],
})
export class AppModule {}
