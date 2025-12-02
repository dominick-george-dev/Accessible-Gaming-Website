import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { DatabaseModule } from '../database/database.module';
import { AccessibilityTagsService } from '../accessibility-tags/accessibility-tags.service';
import { DatabaseService } from '../database/database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule, 
    ],
    controllers: [GamesController],
    providers: [GamesService, DatabaseService, AccessibilityTagsService],
})
export class GamesModule {}