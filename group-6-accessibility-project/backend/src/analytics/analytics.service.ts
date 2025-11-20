import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { GameAnalytics } from "./interfaces/game-analytics.interface";

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getGameAnalytics(gameId: number): Promise<GameAnalytics> {
    // ---------- TOTAL VIEWS ----------
    const totalViews = await this.db.view.count({
      where: { gameId },
    });

    // ---------- TOTAL REVIEWS ----------
    const totalReviews = await this.db.review.count({
      where: { gameId },
    });

    // ---------- AVERAGE RATING ----------
    const avgRatingResult = await this.db.review.aggregate({
      where: { gameId },
      _avg: { rating: true },
    });

    const averageRating = avgRatingResult._avg.rating;

    // ---------- DAILY VIEW TIMELINE ----------
    const dailyViewsRaw = await this.db.$queryRaw<
      { date: string; count: number }[]
    >`
        SELECT 
          DATE("createdAt") AS date,
          COUNT(*) AS count
        FROM "View"
        WHERE "gameId" = ${gameId}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC;
    `;

    return {
      totalViews,
      totalReviews,
      averageRating,
      dailyViews: dailyViewsRaw,
    };
  }
}
