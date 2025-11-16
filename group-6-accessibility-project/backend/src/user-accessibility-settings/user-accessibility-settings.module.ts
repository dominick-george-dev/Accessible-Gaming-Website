import { Module } from '@nestjs/common';
import { UserAccessibilitySettingsController } from './user-accessibility-settings.controller';
import { UserAccessibilitySettingsService } from './user-accessibility-settings.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserAccessibilitySettingsController],
  providers: [UserAccessibilitySettingsService],
  exports: [UserAccessibilitySettingsService],
})
export class UserAccessibilitySettingsModule {}
