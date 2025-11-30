import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// Simple XSS sanitization for output
function sanitize(text: any): string {
  if (typeof text !== 'string') return text;
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Strict numeric validator
function ensureNumber(value: any, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new BadRequestException(`Invalid number provided for ${field}`);
  }
  return value;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getPublisherAnalytics(userId: number) {
    try {
      // Validate input early to prevent injection attacks
      ensureNumber(userId, "userId");
      
      //fetch publisher ID from user ID
      const publisher = await this.db.publisher.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (!publisher) {
        throw new BadRequestException('Publisher not found for the given user ID');
      }
      const publisherId = publisher.id;

      // Total games
      const totalGamesPromise = this.db.game.count({
        where: { publisherId }
      });

      // Average rating across all games (use the Game table, not reviews)
      const avgRatingPromise = this.db.game.aggregate({
        where: { publisherId },
        _avg: { rating: true }
      });

      // Top 5 viewed games
      const topViewedPromise = this.db.view.groupBy({
        by: ["gameId"],
        where:{
          game: { publisherId }
        },
        _count: { gameId: true },
        orderBy: { _count: { gameId: "desc" } },
        take: 5
      });

      // Top 5 rated games
      const topRatedPromise = this.db.game.findMany({
        where: { publisherId },
        orderBy: { rating: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
        },
      });

      // Accessibility features grouped by CATEGORY
      const accessibilityTagsPromise = this.db.gameAccessibilityTags.findMany({
        where: { game: { publisherId } },
        select: {
          accessibilityTags: {
            select: {
              category: true
            }
          }
        }
      });

      // Game-level analytics (views, ratings, reviews)
      const gamesPromise = this.db.game.findMany({
        where: { publisherId },
        include: {
          _count: { select: { views: true, reviews: true } },
          reviews: {
            select: { rating: true }
          }
        }
      });
      // Daily views per game
      const dailyViewsPromise = this.db.view.findMany({
        where: { game: { publisherId } },
        select: {
          gameId: true,
          viewedAt: true,
        },
        orderBy: {
          viewedAt: 'asc'
        }
      });
      //Favourites per game
      const favouritesPromise = this.db.favourites.findMany({
        where: { Game: { publisherId } },
        select: {
          gameId: true,
          userId: true,
        }
      });

      // Execute all queries in parallel
      const [
        totalGames,
        avgRatingResult,
        topViewed,
        topRated,
        accessibilityTags,
        games,
        dailyViewsRaw,
        favourites
      ] = await Promise.all([
        totalGamesPromise,
        avgRatingPromise,
        topViewedPromise,
        topRatedPromise,
        accessibilityTagsPromise,
        gamesPromise,
        dailyViewsPromise,
        favouritesPromise
      ]);

      // Process game-level analytics
      const perGameAnalytics = games.map(game => {
        // Use the rating from the games table (already averaged by trigger)
        const avgRating = typeof game.rating === 'number' ? Number(game.rating.toFixed(1)) : 0;

        // Aggregate daily views for this game
        const dailyViewsMap: Record<string, number> = {};

        dailyViewsRaw
          .filter(d => d.gameId === game.id)
          .forEach(d => {
            const date = d.viewedAt.toISOString().split('T')[0]; // YYYY-MM-DD
            dailyViewsMap[date] = (dailyViewsMap[date] || 0) + 1;
          });

        // Convert map to array
        const dailyViews = Object.entries(dailyViewsMap)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Map favourites for this game
        const gameFavourites = favourites.filter(f => f.gameId === game.id);

        return {
          gameId: game.id,
          title: sanitize(game.title),
          totalViews: game._count.views,
          totalReviews: game._count.reviews,
          avgRating,
          dailyViews,
          favourites: gameFavourites
        };
      });

      // Group accessibility tags by category
      const categoryCountMap: Record<string, number> = {};

      for (const entry of accessibilityTags) {
        const category = sanitize(entry.accessibilityTags.category);
        categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
      }
      // Convert Map to Array
      const accessibilityFeatureDistribution = Object.entries(categoryCountMap).map(
        ([category, count]) => ({category,count})
      );

      // Final return
      return {
        totalGames,
        avgTotalRating: Number((avgRatingResult._avg.rating || 0).toFixed(1)),
        topViewedGames: topViewed.map(t => ({ ...t })),
        topRatedGames: topRated.map(g => ({
          gameId: g.id,
          avgRating: typeof g.rating === 'number' ? Number(g.rating.toFixed(1)) : 0
        })),
        accessibilityFeatureDistribution,
        games: perGameAnalytics
      };

    } catch (e) {
      console.error(e);
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException("Failed to fetch publisher analytics.");
    }
  }
}
