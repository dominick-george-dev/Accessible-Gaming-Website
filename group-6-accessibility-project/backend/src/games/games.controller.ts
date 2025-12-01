import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UsePipes,
    ValidationPipe,
    HttpException,
    HttpStatus,
    ParseIntPipe,
    UseGuards,
    Req
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { GameIdParamDto } from './dto/game-id-param.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
import { CreateViewDto } from './dto/create-view.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    //Only admin and publisher role can create games
    @Post()
    @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
    @Roles('PUBLISHER', 'ADMIN')
    async create(@Body() createGameDto: CreateGameDto) {
        console.log('POST /games endpoint HIT');
        console.log('Request body received:', JSON.stringify(createGameDto, null, 2));

        try {
            const result = await this.gamesService.create(createGameDto);
            console.log('Controller: Game creation successful');
            return result;
        } catch (error) {
            console.error('Controller: Game creation failed:', error.message);
            throw error;
        }
    }

    @Get('/gameDetails/:id')
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

    @Get('/getall')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getAllGamesWithPagination(@Query() query: GetGamesQueryDto) {
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

    @Post('/view/:id')
    createView(@Param("id", ParseIntPipe) id: number, @Body() createViewDto: CreateViewDto) {
        return this.gamesService.createView(id, createViewDto);
    }

    @Get('/similar/:id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    async getSimilarGames(@Param() params: GameIdParamDto) {
        try {
            // optional: accept query params for limit, personalization etc.
            const results = await (this.gamesService as any).findSimilarGames(String(params.id), { limit: 8 });
            // Return the common list shape the frontend expects
            return { data: results };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to retrieve similar games', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id/accessibility-tags')
    async getAccessibilityTagsForGame(@Param('id') id: string) {
        try {
            // Prefer a dedicated service method if implemented
            const svc: any = this.gamesService as any;
            if (typeof svc.getAccessibilityTagsForGame === 'function') {
                return await svc.getAccessibilityTagsForGame(Number(id));
            }

            // Fallback: use findById result (note: findById flattens tags to `accessibilityTags`)
            const game = await this.gamesService.findById(Number(id));
            return game?.accessibilityTags ?? [];
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to retrieve accessibility tags', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        return this.gamesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.gamesService.findOne(+id);
    }

    //Only admin and publisher role can update games
    @Put(':id')
    @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
    @Roles('PUBLISHER', 'ADMIN')
    async update(@Param('id') id: string, @Body() updateGameDto: any, @Req() req: any) {
        console.log('PUT /games/:id endpoint HIT by user:', req.user?.userId, 'role:', req.user?.role);

        try {
            // ✅ Check ownership for publishers
            if (req.user?.role === 'PUBLISHER') {
                await this.checkGameOwnership(+id, req.user.userId);
            }
            // Admins can update any game, no ownership check needed

            return this.gamesService.update(+id, updateGameDto);
        } catch (error) {
            console.error('Controller: Game update failed:', error.message);
            throw error;
        }
    }

    //Only admin and publisher role can delete games
    @Delete(':id')
    @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
    @Roles('PUBLISHER', 'ADMIN')
    async remove(@Param('id') id: string, @Req() req: any) {
        console.log('DELETE /games/:id endpoint HIT by user:', req.user?.userId, 'role:', req.user?.role);

        try {
            // ✅ Check ownership for publishers
            if (req.user?.role === 'PUBLISHER') {
                await this.checkGameOwnership(+id, req.user.userId);
            }
            // Admins can delete any game, no ownership check needed

            return this.gamesService.remove(+id);
        } catch (error) {
            console.error('Controller: Game deletion failed:', error.message);
            throw error;
        }
    }

    //only admin can verify games 
    @Patch(':id/verify')
    @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async verify(@Param('id') id: string, @Req() req: any) {
        console.log('PATCH /games/:id/verify endpoint HIT by admin:', req.user?.userId);

        try {
            return this.gamesService.verify(+id);
        } catch (error) {
            console.error('Controller: Game verification failed:', error.message);
            throw error;
        }
    }

    //only admin can revoke verification on games
    @Patch(':id/revoke-verification')
    @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async revokeVerification(@Param('id') id: string, @Req() req: any) {
        console.log('PATCH /games/:id/revoke-verification endpoint HIT by admin:', req.user?.userId);

        try {
            return this.gamesService.revokeVerification(+id);
        } catch (error) {
            console.error('Controller: Revoke verification failed:', error.message);
            throw error;
        }
    }

    private async checkGameOwnership(gameId: number, userId: number) {
        try {
            const game = await this.gamesService.findGameWithPublisher(gameId);

            if (!game) {
                throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
            }

            if (!game.Publisher) {
                throw new HttpException('Game has no associated publisher', HttpStatus.FORBIDDEN);
            }

            if (game.Publisher.userId !== userId) {
                throw new HttpException(
                    `Forbidden: You can only modify games that belong to your publisher account. This game belongs to publisher ID`,
                    HttpStatus.FORBIDDEN
                );
            }

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Ownership check failed:', error);
            throw new HttpException('Failed to verify game ownership', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}