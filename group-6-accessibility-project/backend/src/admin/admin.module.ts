import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { AccessibilityTagsService } from '../accessibility-tags/accessibility-tags.service';
import { DatabaseService } from '../database/database.service';

@Module({
    imports: [DatabaseModule],
    controllers: [AdminController],
    providers: [AdminService, DatabaseService, AccessibilityTagsService],
})
export class AdminModule {}