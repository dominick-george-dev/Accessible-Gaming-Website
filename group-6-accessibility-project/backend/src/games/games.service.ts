import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { CreateViewDto } from './dto/create-view.dto';

@Injectable()
export class GamesService {
    private readonly MAX_PAGE_SIZE = 100;
    private readonly DEFAULT_PAGE_SIZE = 20;

    constructor(private readonly databaseService: DatabaseService) {}

    async findById(id: number) {
        // Ensure id is a valid positive integer
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
            throw new BadRequestException('Invalid game ID');
        }        try {
            const game = await this.databaseService.game.findUnique({
                where: {
                    id,
                },   
            });

            if (!game) {
                throw new NotFoundException(`Game with ID ${id} not found`);
            }

            return game;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            // Don't leak database errors
            throw new BadRequestException('Failed to retrieve game');
        }
    }

async findAll(page: number = 1, limit: number = 20) {
    // Validate and sanitize inputs
    const validatedPage = Math.max(1, Math.floor(page) || 1);
    const validatedLimit = Math.min(
        this.MAX_PAGE_SIZE,
        Math.max(1, Math.floor(limit) || this.DEFAULT_PAGE_SIZE)
    );

    const skip = (validatedPage - 1) * validatedLimit;

    try {
        const [games, total] = await Promise.all([
            this.databaseService.game.findMany({
                skip,
                take: validatedLimit,
                include: {
                    gameAccessibilityTags: {
                        include: {
                            accessibilityTags: true
                        }
                    },
                },
                
                
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.databaseService.game.count(),
        ]);

        // Flatten accessibilityTags for frontend
        const mappedGames = games.map(game => ({
            ...game,
            accessibilityTags: game.gameAccessibilityTags.map(gat => gat.accessibilityTags),
            images: game.images ?? [],
        }));
        return {
            data: mappedGames,
            pagination: {
                page: validatedPage,
                limit: validatedLimit,
                total,
                totalPages: Math.ceil(total / validatedLimit),
            },
        };
    } catch (error) {
        // Don't leak database errors
        throw new BadRequestException('Failed to retrieve games');
    }
    
}
async createView(id: number, dto: CreateViewDto) {
        return this.databaseService.view.create({
            data:{
                viewedAt: dto.viewedAt,
                game: {
                    connect: {id: id}
                },
            }
        });
    }
}
