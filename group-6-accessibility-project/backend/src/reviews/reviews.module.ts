import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, DatabaseService],
})
export class ReviewsModule {}
