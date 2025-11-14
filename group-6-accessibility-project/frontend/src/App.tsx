// ...existing code...
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Star } from "lucide-react";
import type { Game } from "./types/game";
import { mockGames } from "./data/mockData";
import { useState } from "react";

interface BrowsePageProps {
  games: Game[];
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  onGameClick: (gameId: string) => void;
}

export function BrowsePage({
  games,
  favorites,
  onToggleFavorite,
  onGameClick,
}: BrowsePageProps) {
  // ...existing code...
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Browse Accessible Games</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const isFavorite = favorites.includes(game.id);

          return (
            <Card
              key={game.id}
              className="group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onGameClick(game.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onGameClick(game.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="truncate text-lg font-semibold">
                  {/* fallback to title/name */}
                  {("name" in game ? (game as any).name : (game as any).title) || "Untitled"}
                </CardTitle>

                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(game.id);
                  }}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                <img
                  src={("coverImage" in game ? (game as any).coverImage : (game as any).thumbnail) || ""}
                  alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`}
                  className="rounded-md w-full h-40 object-cover"
                />

                <p className="text-sm text-muted-foreground truncate">
                  {Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}
                </p>

                <div className="flex flex-wrap gap-2">
                  {((game as any).accessibilityTags || []).map((tag: any) => (
                    <span
                      key={tag.id || tag.name}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {tag.name ?? tag.label ?? tag.tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {games.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No games found.</p>
      )}
    </div>
  );
}

// New App wrapper that provides props so nothing crashes at runtime
export default function App() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGameClick = (id: string) => {
    // replace with navigation later
    console.log("Navigate to game:", id);
  };

  return (
    <BrowsePage
      games={mockGames}
      favorites={favorites}
      onToggleFavorite={handleToggleFavorite}
      onGameClick={handleGameClick}
    />
  );
}
// ...existing code...