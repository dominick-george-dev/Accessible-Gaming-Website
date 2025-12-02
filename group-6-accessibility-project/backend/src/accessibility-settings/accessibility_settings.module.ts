import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { AccessibilitySettingsController } from './accessibility_settings.controller';
import { AccessibilitySettingsService } from './accessibility_settings.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AccessibilitySettingsController],
  providers: [AccessibilitySettingsService, DatabaseService],
})
export class AccessibilitySettingsModule {}
