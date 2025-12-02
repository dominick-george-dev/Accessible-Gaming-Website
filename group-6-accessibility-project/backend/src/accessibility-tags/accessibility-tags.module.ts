import { Module } from '@nestjs/common';
import { AccessibilityTagsService } from './accessibility-tags.service';
import { AccessibilityTagsController } from './accessibility-tags.controller';
import { DatabaseService } from '../database/database.service';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AccessibilityTagsController],
  providers: [AccessibilityTagsService, DatabaseService],
})
export class AccessibilityTagsModule {}
