import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GamesService } from './games.service';
import { Prisma } from '@prisma/client';

@Controller('games')
export class GamesController {

    constructor(private readonly gamesService: GamesService) {}

    // Define your endpoints here
    @Get('/gameDetails/:id')
    getGameDetails(@Param('id', ParseIntPipe) id: number) {
        // Logic to get game details by ID
        return this.gamesService.findById(id);
    }
    @Get('/getall')
    getAllGames() {
        // Logic to get game details by ID
        return this.gamesService.findAll();
    }
}