import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilityTagsModule, ReviewsModule],
  controllers: [AppController],
})
export class AppModule {}
