export interface GameAnalytics {
  totalViews: number;
  totalReviews: number;
  averageRating: number | null;
  dailyViews: { date: string; count: number }[];
}