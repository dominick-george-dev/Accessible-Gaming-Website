import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { DatabaseModule } from './database/database.module';
import { AccessibilityTagsModule } from './accessibility-tags/accessibility-tags.module';


@Module({
  imports: [GamesModule, DatabaseModule, AccessibilityTagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
