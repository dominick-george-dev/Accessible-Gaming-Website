import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PublishersModule } from './publishers/publishers.module';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilityTagsModule, ReviewsModule, UsersModule, AuthModule, PublishersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
