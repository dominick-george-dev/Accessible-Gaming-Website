import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getPublisherAnalytics(publisherId: number) {
    try {
      // 1. Total games
      const totalGamesPromise = this.db.game.count({
        where: { publisherId }
      });

      // 2. Average rating across all games (use reviews for true avg)
      const avgRatingPromise = this.db.review.aggregate({
        where: { game: { publisherId } },
        _avg: { rating: true }
      });

      // 3. Top 5 viewed games
      const topViewedPromise = this.db.view.groupBy({
        by: ["gameId"],
        _count: { gameId: true },
        orderBy: { _count: { gameId: "desc" } },
        take: 5
      });

      // 4. Top 5 rated games (avg rating per game)
      const topRatedPromise = this.db.review.groupBy({
        by: ["gameId"],
        _avg: { rating: true },
        orderBy: { _avg: { rating: "desc" } },
        take: 5
      });

      // 5. Accessibility distribution
      const accessibilityDistributionPromise = this.db.gameAccessibilityTags.groupBy({
        by: ["accessibilityTagsId"],
        _count: { accessibilityTagsId: true },
        where: { game: { publisherId } }
      });

      // 6. Game-level analytics (views, avg rating, reviews)
      const gamesPromise = this.db.game.findMany({
        where: { publisherId },
        include: {
          _count: { select: { views: true, reviews: true } },
          reviews: {
            select: { rating: true }
          }
        }
      });

      // Execute all queries in parallel
      const [
        totalGames,
        avgRatingResult,
        topViewed,
        topRated,
        accessibilityDist,
        games
      ] = await Promise.all([
        totalGamesPromise,
        avgRatingPromise,
        topViewedPromise,
        topRatedPromise,
        accessibilityDistributionPromise,
        gamesPromise
      ]);

      // --- Process game-level analytics ---
      const perGameAnalytics = games.map(game => {
        const avgRating =
          game.reviews.length > 0
            ? Number(
                (
                  game.reviews.reduce((a, r) => a + r.rating, 0) /
                  game.reviews.length
                ).toFixed(1)
              )
            : 0;

        return {
          gameId: game.id,
          title: game.title,
          totalViews: game._count.views,
          totalReviews: game._count.reviews,
          avgRating
        };
      });

      return {
        totalGames,
        avgTotalRating: Number((avgRatingResult._avg.rating || 0).toFixed(1)),
        topViewedGames: topViewed,
        topRatedGames: topRated.map(r => ({
          gameId: r.gameId,
          avgRating: Number((r._avg.rating || 0).toFixed(1))
        })),
        accessibilityFeatureDistribution: accessibilityDist,
        games: perGameAnalytics
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("Failed to fetch publisher analytics.");
    }
  }
}