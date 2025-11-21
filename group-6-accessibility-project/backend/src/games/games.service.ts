import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GamesService {
    private readonly MAX_PAGE_SIZE = 100;
    private readonly DEFAULT_PAGE_SIZE = 20;

    constructor(private readonly databaseService: DatabaseService) {}

    async findById(id: number) {
        if (!id || id < 1 || !Number.isInteger(id)) {
            throw new BadRequestException('Invalid game ID');
        }

        try {
            const game = await this.databaseService.game.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    genre: true,
                    releaseDate: true,
                    developer: true,
                    publisher: true,
                    rating: true,
                    createdAt: true,
                    updatedAt: true,
                    // Exclude sensitive fields if any
                },
            });

            if (!game) {
                throw new NotFoundException(`Game with ID ${id} not found`);
            }

            return game;
        } catch (error) {
            if (error instanceof NotFoundException) {
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
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        genre: true,
                        releaseDate: true,
                        developer: true,
                        publisher: true,
                        rating: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.databaseService.game.count(),
            ]);

            return {
                data: games,
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
    async findAll(){
        return this.databaseService.game.findMany()
        }
}

