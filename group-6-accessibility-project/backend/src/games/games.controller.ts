import { Controller, Get, Param, Query, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { GameIdParamDto } from './dto/game-id-param.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/gameDetails/:id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getGameDetails(@Param() params: GameIdParamDto | number) {
        const id = typeof params === 'number' ? params : params.id;
        try {
            return await this.gamesService.findById(id);
        } catch (error) {
            // Re-throw HTTP exceptions as-is
            if (error instanceof HttpException) {
                throw error;
            }
            // Don't leak internal errors
            throw new HttpException('Failed to retrieve game details', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getAllGames(@Query() query: GetGamesQueryDto) {
        try {
            return await this.gamesService.findAll(query.page, query.limit);
        } catch (error) {
            // Re-throw HTTP exceptions as-is
            if (error instanceof HttpException) {
                throw error;
            }
            // Don't leak internal errors
            throw new HttpException('Failed to retrieve games', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('/getall')
    getAllGames() {
        // Logic to get game details by ID
        return this.gamesService.findAll();
    }
}