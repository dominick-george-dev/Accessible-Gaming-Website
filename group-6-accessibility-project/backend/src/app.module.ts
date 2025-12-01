import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AccessibilitySettingsModule } from './accessibility-settings/accessibility_settings.module';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilitySettingsModule, AccessibilityTagsModule, ReviewsModule, UsersModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
