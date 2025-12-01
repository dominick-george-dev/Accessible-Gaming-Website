import { useEffect, useState } from "react";
import { Charts } from "./charts/Charts";
import { BarChartCard } from "./charts/BarChartCard";
import { PieChartCard } from "./charts/PieChartCard";
import { LineChartCard } from "./charts/LineChartCard";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BarChart3, Eye, Star, TrendingUp } from "lucide-react";

export function PublisherAnalyticsTab() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const { id } = useParams<{id: string}>();
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);



  useEffect(() => {
  setLoading(true);
  loadAnalytics().finally(() => setLoading(false));
}, []);


  const loadAnalytics = async () => {
  try {
    const res = await fetch(`http://localhost:3000/analytics/publisher`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      },
    });
    if (res.status === 403) {
      setUnauthorized(true);
      setAnalytics(null);
      return;
    }
    if (!res.ok) {
      throw new Error("Failed to load analytics");
    }
    const data = await res.json();
    setAnalytics(data);
  } catch (err) {
    console.error("Error loading analytics", err);
  }
};

  if (loading) return <p>Loading analytics...</p>;
  if (unauthorized) return <p style={{ color: "red" }}>Unauthorized access. You do not have permission to view this data.</p>;
  if (!analytics) return <p>Failed to load analytics...</p>;

  console.log("Analytics Data:", analytics);
  // Handle clicks on table row
  const handleRowClick = (game: any) => {
    setSelectedGame(game);
    setOpen(true);
  };

  // Transform API data to Chart data

  // Top 5 games
  const topGamesByViews = analytics.topViewedGames.map((item: any) => {
    const game = analytics.games.find((g: any) => g.gameId === item.gameId);
    return {
      name: game?.title ?? "Unknown",
      views: item._count.gameId,
    };
  });

  // Top 5 rated games
  const topGamesByRating = analytics.topRatedGames.map((item: any) => {
    const game = analytics.games.find((g: any) => g.gameId === item.gameId);
    return {
      name: game?.title ?? "Unknown",
      rating: item.avgRating,
    };
  });

  // Accessibility Feature Distribution by category
  const accessibilityDistribution = analytics.accessibilityFeatureDistribution.map(
    (tag: any) => ({
      category: tag.category,
      count: tag.count,
    })
  );

  // Analytics per game
  const gamesDetails = analytics.games;


  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Game Analytics</h1>
        <p className="text-muted-foreground">
          Insights and performance metrics
        </p>
      </div>

      <Separator />

      {/* High-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="text-left mt-2">
              <p>Total Games</p>
              <h2 className="text-3xl">{analytics.totalGames}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            
            <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left mt-2">
              <p>Total Views</p>
              <h2 className="text-3xl">{analytics.games.reduce((s: number, g: any) => s + g.totalViews, 0)}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-950 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div className="text-left mt-2">
              <p>Total Reviews</p>
              <h2 className="text-3xl">{analytics.games.reduce((s: number, g: any) => s + g.totalReviews, 0)}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-950 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
            </div>
            <div className="text-left mt-2">
              <p>Avg Rating</p>
              <h2 className="text-3xl">{analytics.avgTotalRating.toFixed(1)}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Charts title="Game Analytics Charts">
        <BarChartCard
          title="Top Games by Views"
          data={topGamesByViews}
          xKey="name"
          yKey="views"
        />

        <BarChartCard
          title="Top Rated Games"
          data={topGamesByRating}
          xKey="name"
          yKey="rating"
          color="#f59e0b"
        />

        <PieChartCard
          title="Accessibility Distribution"
          data={accessibilityDistribution}
          nameKey="category"
          valueKey="count"
          colors={["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"]}
        />
      </Charts>

      {/* Individual Game Stats */}
      <Card className="p-6">
        <h3 className="mb-4">Game Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Game</th>
                <th className="text-right p-3">Views</th>
                <th className="text-right p-3">Reviews</th>                
                <th className="text-right p-3">Rating</th>
                <th className="text-right p-3">Favourites</th>
              </tr>
            </thead>
            <tbody>
              {gamesDetails.map((games: any) => {
                return (
                  <tr key={games.gameId} className="border-b hover:bg-muted/50 "   onClick={() => handleRowClick(games)}
>
                    <td className="text-left p-3">{games?.title || 'Unknown'}</td>
                    <td className="text-right p-3">{games.totalViews.toLocaleString()}</td>
                    <td className="text-right p-3">{games.totalReviews.toLocaleString()}</td>                    
                    <td className="text-right p-3">{games?.avgRating.toFixed(1) || 'N/A'}</td>
                    <td className="text-right p-3">{games?.favourites.length || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Modal/Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>
              {selectedGame?.title || "Game"} - Daily Views
            </DialogTitle>
          </DialogHeader>
          {/* Display selected games daily views or No data available */}
          {selectedGame ? (
            <LineChartCard
              title="Daily Views"
              data={selectedGame.dailyViews}
              xKey="date"
              yKey="count"
            />
          ) : (
            <p>No data available</p>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
