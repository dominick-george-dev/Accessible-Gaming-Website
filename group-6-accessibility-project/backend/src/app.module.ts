import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UserAccessibilitySettingsModule } from './user-accessibility-settings/user-accessibility-settings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GamesModule,
    DatabaseModule,
    AccessibilityTagsModule,
    ReviewsModule,
    UserAccessibilitySettingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
