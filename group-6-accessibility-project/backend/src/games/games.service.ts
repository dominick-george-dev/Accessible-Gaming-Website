import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { CreateViewDto } from './dto/create-view.dto';
import { AccessibilityTagsService } from '../accessibility-tags/accessibility-tags.service';
import { hasLift } from 'rxjs/internal/util/lift';

@Injectable()
export class GamesService {
    private readonly MAX_PAGE_SIZE = 100;
    private readonly DEFAULT_PAGE_SIZE = 20;

    constructor(
        private readonly databaseService: DatabaseService,
        @Optional() private readonly accessibilityTagsService?: AccessibilityTagsService
    ) { }

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
                    hasBeenVerified: true,
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
                        hasBeenVerified: true,
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

    async create(createGameDto: any) {
        console.log('Received data:', createGameDto);

        const { accessibilityTagIds, selectedTags, id, ...gameData } = createGameDto;

        // Use either accessibilityTagIds or selectedTags (they're the same thing)
        const tagIds = accessibilityTagIds || selectedTags || [];

        console.log('Game data to save:', gameData);
        console.log('Tag IDs:', tagIds);
        console.log('Excluded ID:', id);

        // Create the game
        const game = await this.databaseService.game.create({
            data: {
                title: gameData.title,
                description: gameData.description,
                developer: gameData.developer,
                genre: gameData.genre,
                rating: gameData.rating || 0,
                releaseDate: new Date(gameData.releaseDate),
                images: gameData.images || [],
                trailer: gameData.trailer || null,
                transcript: gameData.transcript || null,
                publisherId: gameData.publisherId,
                hasBeenVerified: false,
            }
        });

        console.log('Game created:', game);

        // Add accessibility tags if provided
        if (tagIds && tagIds.length > 0) {
            await this.databaseService.gameAccessibilityTags.createMany({
                data: tagIds.map((tagId: number) => ({
                    gameId: game.id,
                    accessibilityTagsId: tagId
                }))
            });
        }

        // Return the game with tags
        return this.databaseService.game.findUnique({
            where: { id: game.id },
            include: {
                gameAccessibilityTags: {
                    include: {
                        accessibilityTags: true
                    }
                }
            }
        });
    }

    async findOne(id: number) {
        return this.databaseService.game.findUnique({
            where: { id },
            include: {
                gameAccessibilityTags: {
                    include: {
                        accessibilityTags: true
                    }
                }
            }
        });
    }

    async update(id: number, updateGameDto: any) {
        const { accessibilityTagIds, selectedTags, ...gameData } = updateGameDto;

        const tagIds = accessibilityTagIds || selectedTags;

        await this.databaseService.game.update({
            where: { id },
            data: {
                ...gameData,
                releaseDate: gameData.releaseDate ? new Date(gameData.releaseDate) : undefined,
            }
        });

        // Update accessibility tags if provided
        if (tagIds !== undefined) {
            // Remove existing tags
            await this.databaseService.gameAccessibilityTags.deleteMany({
                where: { gameId: id }
            });

            // Add new tags
            if (tagIds.length > 0) {
                await this.databaseService.gameAccessibilityTags.createMany({
                    data: tagIds.map((tagId: number) => ({
                        gameId: id,
                        accessibilityTagsId: tagId
                    }))
                });
            }
        }

        // Return updated game with tags
        return this.databaseService.game.findUnique({
            where: { id },
            include: {
                gameAccessibilityTags: {
                    include: {
                        accessibilityTags: true
                    }
                }
            }
        });
    }

    async remove(id: number) {
        try {
            // 1. Delete reviews first (they reference the game)
            await this.databaseService.review.deleteMany({
                where: { gameId: id }
            });
            // 2. Delete game accessibility tags (junction table)
            await this.databaseService.gameAccessibilityTags.deleteMany({
                where: { gameId: id }
            });
            // 3. Finally delete the game itself
            const deletedGame = await this.databaseService.game.delete({
                where: { id }
            });

            console.log(`Game ${id} and all related records deleted successfully`);
            return deletedGame;

        } catch (error) {
            console.error('Error deleting game:', error);
            throw new Error(`Failed to delete game: ${error.message}`);
        }
    }

    async verify(id: number) {
        try {
            if (!Number.isInteger(id) || id < 1) {
                throw new BadRequestException('Invalid game ID');
            }

            // Check if game exists
            const existingGame = await this.databaseService.game.findUnique({
                where: { id },
                select: { id: true, title: true, hasBeenVerified: true }
            });

            if (!existingGame) {
                throw new NotFoundException(`Game with ID ${id} not found`);
            }

            // Update the verification status
            const verifiedGame = await this.databaseService.game.update({
                where: { id },
                data: { hasBeenVerified: true }
            });

            console.log(`Game ${id} (${existingGame.title}) verified successfully`);
            return verifiedGame;

        } catch (error) {
            console.error('Error verifying game:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to verify game: ${error.message}`);
        }
    }

    async createView(id: number, dto: CreateViewDto) {
        return this.databaseService.view.create({
            data: {
                viewedAt: dto.viewedAt,
                game: {
                    connect: { id: id }
                },
            }
        });
    }
    // Add this to your games.service.ts
    async revokeVerification(id: number) {
        try {
            // Validate the game ID
            if (!Number.isInteger(id) || id < 1) {
                throw new BadRequestException('Invalid game ID');
            }

            // Check if game exists
            const existingGame = await this.databaseService.game.findUnique({
                where: { id },
                select: { id: true, title: true, hasBeenVerified: true }
            });

            if (!existingGame) {
                throw new NotFoundException(`Game with ID ${id} not found`);
            }

            // Update the verification status to false
            const updatedGame = await this.databaseService.game.update({
                where: { id },
                data: { hasBeenVerified: false }
            });

            console.log(`Game ${id} (${existingGame.title}) verification revoked`);
            return updatedGame;

        } catch (error) {
            console.error('Error revoking game verification:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to revoke verification: ${error.message}`);
        }
    }

    async findGameWithPublisher(id: number) {
        try {
            return await this.databaseService.game.findUnique({
                where: { id },
                include: {
                    Publisher: {
                        select: {
                            userId: true 
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error finding game with publisher:', error);
            throw new Error(`Failed to find game: ${error.message}`);
        }
    }
}
