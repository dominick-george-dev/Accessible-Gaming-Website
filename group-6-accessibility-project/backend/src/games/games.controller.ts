import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GamesService } from './games.service';

interface CreateGameDto {
    title: string;
    description: string;
    developer: string;
    genre: string[];
    rating: number;
    releaseDate: string;
    images: string[];
    trailer?: string;
    transcript?: string;
    publisherId: number;
    accessibilityTagIds: number[];
}

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Get('/gameDetails/:id')
    getGameDetails(@Param('id', ParseIntPipe) id: number) {
        return this.gamesService.findById(id);
    }

    @Post()
    async create(@Body() createGameDto: CreateGameDto) {
        return this.gamesService.create(createGameDto);
    }

    @Get()
    async findAll() {
        return this.gamesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.gamesService.findOne(+id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateGameDto: any) {
        return this.gamesService.update(+id, updateGameDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.gamesService.remove(+id);
    }
}