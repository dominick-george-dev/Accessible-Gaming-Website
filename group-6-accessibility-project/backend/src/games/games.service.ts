import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AccessibilityTagsService } from '../accessibility-tags/accessibility-tags.service';

@Injectable()
export class GamesService {
    private readonly MAX_PAGE_SIZE = 100;
    private readonly DEFAULT_PAGE_SIZE = 20;

    constructor(
        private readonly databaseService: DatabaseService,
        @Optional() private readonly accessibilityTagsService?: AccessibilityTagsService
    ) {}

    async findById(id: number) {
        // Ensure id is a valid positive integer
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
            throw new BadRequestException('Invalid game ID');
        }

        try {
            const game = await this.databaseService.game.findUnique({
                where: { id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    images: true,
                    trailer: true,
                    transcript: true,
                    genre: true,
                    releaseDate: true,
                    developer: true,
                    rating: true,
                    createdAt: true,
                    updatedAt: true,
                    gameAccessibilityTags: {
                        select: {
                            accessibilityTags: true,
                        },
                    },
                    // Exclude sensitive fields if any
                },
            });

            if (!game) {
                throw new NotFoundException(`Game with ID ${id} not found`);
            }

            // Flatten accessibilityTags and normalize images to match frontend expectations
            const { gameAccessibilityTags, images, ...rest } = game as any;
            return {
                ...rest,
                accessibilityTags: (gameAccessibilityTags ?? []).map((gat: any) => gat.accessibilityTags),
                images: images ?? [],
            };
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
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        images: true,
                        trailer: true,
                        transcript: true,
                        genre: true,
                        releaseDate: true,
                        developer: true,
                        rating: true,
                        createdAt: true,
                        updatedAt: true,
                        gameAccessibilityTags: {
                            select: {
                                accessibilityTags: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.databaseService.game.count(),
            ]);

            // Flatten accessibilityTags for frontend
            const mappedGames = games.map(game => {
                const { gameAccessibilityTags, images, ...rest } = game as any;
                return {
                    ...rest,
                    accessibilityTags: (gameAccessibilityTags ?? []).map((gat: any) => gat.accessibilityTags),
                    images: images ?? [],
                };
            });

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

    async findSimilarGames(id: string | number, options: { limit?: number } = {}) {
        try {
            const gameId = typeof id === 'string' ? Number(id) : id;
            if (!Number.isInteger(gameId) || gameId < 1) {
                throw new BadRequestException('Invalid game ID');
            }

            const limit = Math.max(1, Math.min(this.MAX_PAGE_SIZE, Math.floor(options.limit ?? 8)));

            const target = await this.databaseService.game.findUnique({
                where: { id: gameId },
                select: { genre: true },
            });

            if (!target) {
                throw new NotFoundException(`Game with ID ${gameId} not found`);
            }

            const genreFilter = Array.isArray(target.genre) && target.genre.length
                ? { genre: { hasSome: target.genre } }
                : {};

            const whereClause: any = {
                AND: [
                    { id: { not: gameId } },
                    ...(Object.keys(genreFilter).length ? [genreFilter] : []),
                ],
            };

            const selectShape = {
                id: true,
                title: true,
                description: true,
                images: true,
                trailer: true,
                transcript: true,
                genre: true,
                releaseDate: true,
                developer: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
                gameAccessibilityTags: {
                    select: { accessibilityTags: true },
                },
            };

            let similar = await this.databaseService.game.findMany({
                where: whereClause,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: selectShape,
            });

            // Fallback: if no genre-based results, return recent games excluding current id
            if (!similar || similar.length === 0) {
                similar = await this.databaseService.game.findMany({
                    where: { id: { not: gameId } },
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: selectShape,
                });
            }

            return similar.map(g => {
                const { gameAccessibilityTags, images, ...rest } = g as any;
                return {
                    ...rest,
                    accessibilityTags: (gameAccessibilityTags ?? []).map((gat: any) => gat.accessibilityTags),
                    images: images ?? [],
                };
            });
        } catch (error) {
            console.error('findSimilarGames error', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve similar games');
        }
    }
}