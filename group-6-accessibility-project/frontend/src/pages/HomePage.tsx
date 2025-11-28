import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import type { Game } from "../types/game";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

  const resolveImageUrl = (g: any): string | null => {
    const candidate =
      g?.coverImage ??
      g?.thumbnail ??
      g?.image ??
      (Array.isArray(g?.images) && (g.images[0]?.url ?? g.images[0])) ??
      g?.background_image ??
      g?.url;
    if (!candidate) return null;
    const u = String(candidate);
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("//")) return u;
    return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadGames = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/games/getall?page=1&limit=12`;
        console.log("Fetching games from", url);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`);
        const payload = await res.json();
        console.log("raw payload", payload);
        const items = Array.isArray(payload) ? payload : payload?.data ?? [];
        console.debug("Loaded games count:", items.length, "sample:", items[0]);
        setGames(items);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl">
          <h2 className="text-2xl font-bold mb-6">Welcome to AccessPlay</h2>
          <p className="text-muted-foreground mb-4">
            Discover accessible games designed for everyone. Browse our collection of games with detailed accessibility information to find the perfect game for you.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Add featured games or content here */}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h1 className="sr-only">Browse Accessible Games</h1>

        {loading ? (
          <p className="text-center py-8">Loading games…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const rawId = (game as any).id ?? (game as any)._id ?? (game as any).slug ?? (game as any).title ?? (game as any).name;
              const id = typeof rawId === "string" ? rawId : String(rawId);
              const isFavorite = favorites.includes(id);

              return (
                <Card
                  key={id}
                  className="group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleGameClick(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGameClick(id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="truncate text-lg font-semibold">
                      {("name" in game ? (game as any).name : (game as any).title) || "Untitled"}
                    </CardTitle>

                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(id);
                      }}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {(() => {
                      const imgSrc = resolveImageUrl(game as any);
                      if (!imgSrc) {
                        return (
                          <div className="rounded-md w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        );
                      }
                      return (
                        <img
                          src={imgSrc}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            console.warn("Image load failed for", imgSrc);
                          }}
                          alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`}
                          className="rounded-md w-full h-40 object-cover"
                        />
                      );
                    })()}

                    <p className="text-sm text-muted-foreground truncate">
                      {Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {((game as any).accessibilityTags || []).map((tag: any) => (
                        <span key={tag.id || tag.name} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {tag.name ?? tag.label ?? tag.tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && games.length === 0 && <p className="text-center text-muted-foreground py-10">No games found.</p>}
      </div>
    </>
  );
}