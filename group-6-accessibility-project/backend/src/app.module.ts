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
import { UploadModule } from './upload/upload.module';
import { UploadController } from './api/upload/upload.controller';
import { AwsService } from './services/aws/aws.service';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilityTagsModule, ReviewsModule, UsersModule, AuthModule, PublishersModule, UploadModule],
  controllers: [AppController, UploadController],
  providers: [AppService, AwsService],
})
export class AppModule {}
