import { Controller, Get, Post, Param, ParseIntPipe, Body } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateViewDto } from './dto/create-view.dto'
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

    @Post('/view/:id')
    createView(@Param("id", ParseIntPipe) id: number,@Body() createViewDto: CreateViewDto){
        return this.gamesService.createView(id, createViewDto);
    }
}