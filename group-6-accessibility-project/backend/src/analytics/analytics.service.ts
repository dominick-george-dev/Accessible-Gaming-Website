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

  async getPublisherAnalytics(publisherId: number) {
    try {

      // Validate input early to prevent injection attacks
      ensureNumber(publisherId, "publisherId");

      // Total games
      const totalGamesPromise = this.db.game.count({
        where: { publisherId }
      });

      // Average rating across all games
      const avgRatingPromise = this.db.review.aggregate({
        where: { game: { publisherId } },
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
      const topRatedPromise = this.db.review.groupBy({
        by: ["gameId"],
        where:{
          game:{publisherId}
        },
        _avg: { rating: true },
        orderBy: { _avg: { rating: "desc" } },
        take: 5
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

      // Execute all queries in parallel
      const [
        totalGames,
        avgRatingResult,
        topViewed,
        topRated,
        accessibilityTags,
        games,
        dailyViewsRaw
      ] = await Promise.all([
        totalGamesPromise,
        avgRatingPromise,
        topViewedPromise,
        topRatedPromise,
        accessibilityTagsPromise,
        gamesPromise,
        dailyViewsPromise
      ]);

      // Process game-level analytics
      const perGameAnalytics = games.map(game => {
        const avgRating = game.reviews.length > 0
            ? Number(
                (
                  game.reviews.reduce((a, r) => a + r.rating, 0) /
                  game.reviews.length
                ).toFixed(1) // To 1 decimal place
              )
            : 0;

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


        return {
          gameId: game.id,
          title: sanitize(game.title),
          totalViews: game._count.views,
          totalReviews: game._count.reviews,
          avgRating,
          dailyViews
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
        topViewedGames: topViewed.map(t =>({...t})),
        topRatedGames: topRated.map(r => ({
          gameId: r.gameId,
          avgRating: Number((r._avg.rating || 0).toFixed(1))
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
