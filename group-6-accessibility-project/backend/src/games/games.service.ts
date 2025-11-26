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
        }        try {
            const game = await this.databaseService.game.findUnique({
                where: {
                    id,
                },
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
                    gameAccessibilityTags: true,
                    // Exclude sensitive fields if any
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
    }    async findAllWithPagination(page: number = 1, limit: number = 20) {
        // Validate and sanitize inputs
        const validatedPage = Math.max(1, Math.floor(page) || 1);
        const validatedLimit = Math.min(
            this.MAX_PAGE_SIZE,
            Math.max(1, Math.floor(limit) || this.DEFAULT_PAGE_SIZE)
        );

        const skip = (validatedPage - 1) * validatedLimit;

        try {            const [games, total] = await Promise.all([
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

    /**
     * Return top N similar games to the given game id.
     * Returns games with accessibilityTags attached.
     */
    async findSimilarGames(gameId: number | string, opts: { limit?: number; prefs?: any } = {}) {
        const limit = opts.limit ?? 8;

        // normalise id to a positive integer
        const numericId = typeof gameId === 'number' ? gameId : parseInt(String(gameId), 10);
        if (!Number.isInteger(numericId) || numericId < 1) {
            throw new BadRequestException('Invalid game ID');
        }

        // base game must exist
        const base = await this.findById(numericId);
        if (!base) throw new NotFoundException('Game not found');

        // fetch all games
        const allGames = await this.findAllGames();
        if (!Array.isArray(allGames) || allGames.length === 0) return [];

        // ensure we have accessibility tags for baseGame
        const baseTags = base.gameAccessibilityTags ??
            (this.accessibilityTagsService ? (await this.accessibilityTagsService.findAllByGameId(numericId)) : []);

        // score games recieved
        const scored = allGames
            .filter(g => String(g.id) !== String(numericId))
            .map((g) => {
                const genreMatches = (g.genre || []).filter(gn => (base.genre || []).includes(gn)).length;
                const gTagNames = (g.gameAccessibilityTags || []).map((t: any) => (typeof t === 'string' ? t : (t.tag ?? t.name ?? '')));
                const baseTagNames = (baseTags || []).map((t: any) => (typeof t === 'string' ? t : (t.tag ?? t.name ?? '')));
                const tagMatches = gTagNames.filter((t: string) => baseTagNames.includes(t)).length;
                const score = genreMatches * 3 + tagMatches * 4 + ((g.rating as number) || 0) * 0.1;
                return { game: g, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => s.game);

        /* scored is an array of game rows that may include gameAccessibilityTags (join rows)
        Resolve join rows (gameAccessibilityTags) -> full accessibility tag objects
        Collect all referenced accessibility tag IDs for the returned games */
        const allTagIds = new Set<number>();
        const perGameTagIds: Record<number, number[]> = {};
        scored.forEach((g: any) => {
            const links = Array.isArray(g.gameAccessibilityTags) ? g.gameAccessibilityTags : [];
            const ids = links
            .map((r: any) => r.accessibilityTagsId ?? r.accessibilityTagId ?? null)
            .filter((v: any) => typeof v === 'number');
            perGameTagIds[g.id] = ids;
            ids.forEach((i: number) => allTagIds.add(i));
        });

        // If no tag ids at all, return scored games with empty accessibilityTags arrays
        if (allTagIds.size === 0) {
            return scored.map((g: any) => ({ ...g, accessibilityTags: (g.accessibilityTags ?? []) }));
        }

        // Fetch real tag rows in one query
        const tagRows = await this.databaseService.accessibilityTags.findMany({
            where: { id: { in: Array.from(allTagIds) } },
        });
        const tagMap = new Map<number, any>(tagRows.map((t: any) => [t.id, t]));

        // Attach resolved tag objects to each game under accessibilityTags
        const withResolvedTags = scored.map((g: any) => {
            const ids = perGameTagIds[g.id] ?? [];
            const tags = ids.map((tid) => tagMap.get(tid)).filter(Boolean);
            return { ...g, accessibilityTags: tags };
        });

        return withResolvedTags;
    }

    async getAccessibilityTagsForGame(gameId: number) {
        return this.databaseService.gameAccessibilityTags.findMany({
            where: { gameId },
        });
    }

    async findAllGames() {
        return this.databaseService.game.findMany({
            include: {
                gameAccessibilityTags: true,
            },
        });
    }
}

