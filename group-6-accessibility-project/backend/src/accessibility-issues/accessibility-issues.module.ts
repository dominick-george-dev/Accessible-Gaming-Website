import { Module } from '@nestjs/common';
import { AccessibilityIssuesController } from './accessibility-issues.controller';
import { AccessibilityIssuesService } from './accessibility-issues.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccessibilityIssuesController],
  providers: [AccessibilityIssuesService],
})
export class AccessibilityIssuesModule {}