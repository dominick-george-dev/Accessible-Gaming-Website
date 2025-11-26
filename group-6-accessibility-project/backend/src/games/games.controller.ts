import { Controller, Get, Param, Query, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { GameIdParamDto } from './dto/game-id-param.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}    @Get('/gameDetails/:id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getGameDetails(@Param() params: GameIdParamDto) {
        try {
            return await this.gamesService.findById(params.id);
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
    async getAllGamesWithPagination(@Query() query: GetGamesQueryDto) {
        try {
            return await this.gamesService.findAllWithPagination(query.page, query.limit);
        } catch (error) {
            // Re-throw HTTP exceptions as-is
            if (error instanceof HttpException) {
                throw error;
            }
            // Don't leak internal errors
            throw new HttpException('Failed to retrieve games', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/similar/:id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getSimilarGames(@Param() params: GameIdParamDto) {
        try {
            // optional: accept query params for limit, personalization etc.
            const results = await this.gamesService.findSimilarGames(String(params.id), { limit: 8 });
            return results;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to retrieve similar games', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id/accessibility-tags')
    async getAccessibilityTagsForGame(@Param('id') id: string) {
        try {
            // delegate to a dedicated service that returns an array of tags
            console.log('GET /games/:id/accessibility-tags called for id=', id); // DELETE AFTER DEBUGGING
            return await this.gamesService.getAccessibilityTagsForGame(Number(id));
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to retrieve accessibility tags', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/getall')
    getAllGames() {
        // Logic to get all games without pagination
        return this.gamesService.findAllGames();
    }
}