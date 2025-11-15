import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Star, Eye } from "lucide-react";
import type { Game } from "./types/game";
import { mockGames } from "./data/mockData";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { GameDetailPage } from "./pages/GameDetailPage";

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
  const handleCardKeyDown = (e: React.KeyboardEvent, gameId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onGameClick(gameId);
    }
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent, gameId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onToggleFavorite(gameId);
    }
  };

  const getGameName = (game: Game) => {
    return ("name" in game ? (game as any).name : game.title) || "Untitled Game";
  };

  const getGameThumbnail = (game: Game) => {
    return ("coverImage" in game ? (game as any).coverImage : game.thumbnail) || "";
  };

  const getGameGenre = (game: Game) => {
    const genre = (game as any).genre;
    return Array.isArray(genre) ? genre.join(", ") : genre || "";
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Discover Games Section Header */}
      <section aria-labelledby="discover-games-heading">
        <h1 
          id="discover-games-heading" 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-foreground"
        >
          Discover Games
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
          Browse and discover games that match your preferences and accessibility requirements
        </p>

        {/* Game Listings Grid - Responsive and Accessible */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          role="list"
          aria-label="Game listings"
        >
          {games.map((game) => {
            const isFavorite = favorites.includes(game.id);
            const gameName = getGameName(game);
            const gameThumbnail = getGameThumbnail(game);
            const gameGenre = getGameGenre(game);
            const accessibilityTags = game.accessibilityTags || [];

            return (
              <article
                key={game.id}
                role="listitem"
                className="h-full"
              >
                <Card
                  className="group h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:outline-none"
                  onClick={() => onGameClick(game.id)}
                  onKeyDown={(e) => handleCardKeyDown(e, game.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${gameName}, ${game.rating} star rating, ${game.reviewCount} reviews. Click to view details.`}
                  aria-describedby={`game-${game.id}-description game-${game.id}-tags`}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                    <CardTitle 
                      className="text-lg sm:text-xl font-semibold leading-tight flex-1 min-w-0"
                      id={`game-${game.id}-title`}
                    >
                      {gameName}
                    </CardTitle>

                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      size="icon"
                      className="flex-shrink-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(game.id);
                      }}
                      onKeyDown={(e) => handleFavoriteKeyDown(e, game.id)}
                      aria-label={isFavorite ? `Remove ${gameName} from favorites` : `Add ${gameName} to favorites`}
                      aria-pressed={isFavorite}
                      tabIndex={0}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isFavorite 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={gameThumbnail}
                        alt={`${gameName} game cover image`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <p 
                      className="text-sm sm:text-base text-muted-foreground line-clamp-2"
                      id={`game-${game.id}-description`}
                    >
                      {game.description || "No description available."}
                    </p>

                    {gameGenre && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="sr-only">Genre: </span>
                        {gameGenre}
                      </p>
                    )}

                    {/* Accessibility Tags - All tags visible */}
                    {accessibilityTags.length > 0 && (
                      <div 
                        className="flex flex-wrap gap-2 mt-auto pt-2"
                        role="list"
                        aria-label="Accessibility features"
                        id={`game-${game.id}-tags`}
                      >
                        {accessibilityTags.map((tag) => (
                          <span
                            key={tag.id}
                            role="listitem"
                            className="text-xs sm:text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium border border-primary/20"
                            aria-label={`Accessibility feature: ${tag.name}`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rating Information */}
                    <div 
                      className="flex items-center gap-2 text-sm sm:text-base"
                      aria-label={`Rating: ${game.rating} out of 5 stars based on ${game.reviewCount} reviews`}
                    >
                      <Star 
                        className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                        aria-hidden="true"
                      />
                      <span className="font-medium">{game.rating}</span>
                      <span className="text-muted-foreground">({game.reviewCount})</span>
                    </div>

                    {/* View Button - Accessible for screen readers */}
                    <Button
                      variant="default"
                      className="w-full mt-3 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGameClick(game.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onGameClick(game.id);
                        }
                      }}
                      aria-label={`View details for ${gameName}`}
                    >
                      <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                      View Game
                    </Button>
                  </CardContent>
                </Card>
              </article>
            );
          })}
        </div>

        {games.length === 0 && (
          <div className="text-center py-10 sm:py-16" role="status" aria-live="polite">
            <p className="text-base sm:text-lg text-muted-foreground">
              No games found.
            </p>
          </div>
        )}

        {/* Screen reader announcement for game count */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {games.length === 1 
            ? "1 game available" 
            : `${games.length} games available`}
        </div>
      </section>
    </main>
  );
}

// New App wrapper that provides props so nothing crashes at runtime
export default function App() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGameClick = (id: string) => {
    navigate(`/game/${id}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <BrowsePage
            games={mockGames}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onGameClick={handleGameClick}
          />
        }
      />
      <Route path="/game/:id" element={<GameDetailPage />} />
    </Routes>
  );
}