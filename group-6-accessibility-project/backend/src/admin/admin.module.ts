import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';

@Module({
    imports: [DatabaseModule],
    controllers: [AdminController],
    providers: [DatabaseService],
})
export class AdminModule {}