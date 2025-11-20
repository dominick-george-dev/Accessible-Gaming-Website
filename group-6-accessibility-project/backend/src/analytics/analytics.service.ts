import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  // Fetch total views for a game
  async getTotalViews(gameId: number) {
    try {
      return this.db.view.count({ where: { gameId } });
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch total views.');
    }
  }

  // Fetch total reviews for a game
  async getTotalReviews(gameId: number) {
    try {
      return this.db.review.count({ where: { gameId } });
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch reviews.');
    }
  }

  // Fetch average rating for a game
  async getAverageRating(gameId: number) {
    try {
      const result = await this.db.review.aggregate({
        where: { gameId },
        _avg: { rating: true },
      });
      return result._avg.rating || 0;
    } catch (e) {
      throw new InternalServerErrorException('Failed to calculate rating.');
    }
  }

  // Fetch daily views for a game
  async getDailyViews(gameId: number) {
    try {
      return this.db.$queryRaw`
        SELECT DATE("createdAt") AS date, COUNT(*) AS count
        FROM "View"
        WHERE "gameId" = ${gameId}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC;
      `;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch daily views.');
    }
  }
  
  // Fetch all analytics for a game
  async getAllGameAnalytics(gameId: number) {
    try {
      const [views, reviews, rating, daily] = await Promise.all([
        this.getTotalViews(gameId),
        this.getTotalReviews(gameId),
        this.getAverageRating(gameId),
        this.getDailyViews(gameId),
      ]);

      return {
        totalViews: views,
        totalReviews: reviews,
        averageRating: rating,
        dailyViews: daily,
      };
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch analytics.');
    }
  }
}
