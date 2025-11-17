import { Module } from '@nestjs/common';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { AccessibilityTagsController } from './accessibility-tags.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [AccessibilityTagsController],
  providers: [AccessibilityTagsService, DatabaseService],
})
export class AccessibilityTagsModule {}
