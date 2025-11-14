import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {

    constructor(private readonly gamesService: GamesService) {}

    @Get('/gameDetails/:id')
    getGameDetails(@Param('id', ParseIntPipe) id: number) {
        // Logic to get game details by ID
        return this.gamesService.findById(id);
    }

    @Get()
    async getAllGames() {
      return this.gamesService.findAll();
    }
}