import { Charts } from "../charts/Charts";
import { BarChartCard } from "../charts/BarChartCard";
import { PieChartCard } from "../charts/PieChartCard";
import { LineChartCard } from "../charts/LineChartCard";
import type { Game, GameAnalytics } from "../../types/game";

interface DeveloperPageProps {
  games: Game[];
  analytics: GameAnalytics[];
}

export function ChartExample({ games, analytics }: DeveloperPageProps) {
  const topGames = analytics
    .sort((a, b) => b.views - a.views)
    .map(a => ({
      name: games.find(g => g.id === a.gameId)?.title ?? "Unknown",
      views: a.views,
    }));

  const accessibility = [
    { name: "Visual", value: games.filter(g => g.accessibilityTags.some(t => t.category === "visual")).length },
    { name: "Hearing", value: games.filter(g => g.accessibilityTags.some(t => t.category === "hearing")).length },
    { name: "Dexterity", value: games.filter(g => g.accessibilityTags.some(t => t.category === "dexterity")).length },
    { name: "Cognitive", value: games.filter(g => g.accessibilityTags.some(t => t.category === "cognitive")).length },
  ];

 const chartDummyData = {
  topGamesByViews: [
    { name: "Space Voyager", views: 1200 },
    { name: "Racing Rush", views: 1600 },
    { name: "Mystic Forest", views: 950 },
    { name: "Ocean Explorer", views: 750 },
    { name: "Cyber Clash", views: 600 },
  ],

  topGamesByRating: [
    { name: "Racing Rush", rating: 4.8 },
    { name: "Space Voyager", rating: 4.7 },
    { name: "Ocean Explorer", rating: 4.4 },
    { name: "Mystic Forest", rating: 4.2 },
    { name: "Cyber Clash", rating: 3.9 },
  ],

  accessibilityDistribution: [
    { category: "Visual", count: 2 },
    { category: "Hearing", count: 2 },
    { category: "Dexterity", count: 2 },
    { category: "Cognitive", count: 1 },
  ],

  dailyViews: [
    { date: "2025-01-01", count: 120 },
    { date: "2025-01-02", count: 140 },
    { date: "2025-01-03", count: 110 },
    { date: "2025-01-04", count: 130 },
    { date: "2025-01-05", count: 150 },
  ],
};


  return (
    <Charts title="Game Analytics">
      <BarChartCard
        title="Top Games by Views"
        data={chartDummyData.topGamesByViews}
        xKey="name"
        yKey="views"
      />

      <PieChartCard
        title="Accessibility Distribution"
        data={chartDummyData.accessibilityDistribution}
        nameKey="category"
        valueKey="count"
        colors={["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"]}
      />

      <LineChartCard
        title="Daily Views"
        data={chartDummyData.dailyViews}
        xKey="date"
        yKey="count"
      />
    </Charts>
  );
}
