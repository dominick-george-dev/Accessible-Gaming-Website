import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GamesService {

    constructor(private readonly databaseService: DatabaseService) { }

    // Sample method to find all games
    async findById(id: number) {
        return this.databaseService.game.findUnique({
            where: {
                id,
            }
        });
    }

    async create(createGameDto: any) {
        console.log('Received data:', createGameDto);

        const { accessibilityTagIds, selectedTags, ...gameData } = createGameDto;

        // Use either accessibilityTagIds or selectedTags (they're the same thing)
        const tagIds = accessibilityTagIds || selectedTags || [];

        console.log('Game data to save:', gameData);
        console.log('Tag IDs:', tagIds);

        // Create the game
        const game = await this.databaseService.game.create({
            data: {
                ...gameData,
                releaseDate: new Date(gameData.releaseDate),
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

    async findAll() {
        return this.databaseService.game.findMany({
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
        // Delete related accessibility tags first
        await this.databaseService.gameAccessibilityTags.deleteMany({
            where: { gameId: id }
        });
        // Delete the game
        return this.databaseService.game.delete({
            where: { id }
        });
    }
}

