import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Game } from "../types/game";
import { GameCard } from "../components/GameCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { useFavorites } from "../context/FavoritesContext";

// Hook to get user from localStorage
function useUser() {
  const [user, setUser] = useState<{ id: number; username: string; email: string; isAdmin: boolean; isPublisher: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userData = localStorage.getItem("userData");
    if (isLoggedIn && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return { user, loading };
}

export function MyFavoritesPage() {
  const navigate = useNavigate();
  const { favorites, toggle } = useFavorites();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);

  const { user, loading: loadingUser } = useUser();

  // Fetch all games
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadGames = async () => {
      setLoadingGames(true);
      try {
        const res = await fetch("http://localhost:3000/games/getall");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const json = await res.json();
        if (!cancelled) setGames(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error("Failed to load games");
          setGames([]);
        }
      } finally {
        if (!cancelled) setLoadingGames(false);
      }
    };

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loadingUser) {
    return (
      <div className="px-4 py-12 text-center">
        <p>Checking login status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-12 text-center space-y-4">
        <p>You need to log in to view and favorite games.</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (loadingGames) {
    return (
      <div className="px-4 py-12 text-center">
        <p>Loading your games...</p>
      </div>
    );
  }

  // ✅ Convert game.id to number to match favorites array
  const favoriteGames = games.filter(game => favorites.includes(Number(game.id)));

  const suggestions = favoriteGames
    .filter(
      game =>
        searchQuery.length >= 2 &&
        game.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(game => game.title ?? "")
    .slice(0, 5);

  const filteredGames = favoriteGames.filter(game => {
    const title = game.title ?? "";
    const genres = Array.isArray(game.genre) ? game.genre : [];
    const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];
    const q = searchQuery.toLowerCase();

    return (
      q === "" ||
      title.toLowerCase().includes(q) ||
      genres.some(g => (g ?? "").toLowerCase().includes(q)) ||
      tags.some(tag => (tag?.name ?? "").toLowerCase().includes(q))
    );
  });

  return (
    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold mb-6">My Favorites</h2>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search your favorite games..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 w-full"
          />

          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full mt-1 w-full z-50 p-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(s)}
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded"
                >
                  {s}
                </button>
              ))}
            </Card>
          )}
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p>You haven't added any games to your favorites yet. Start browsing to find games you love!</p>
            <Button onClick={() => navigate("/browserpage")}>Browse Games</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {filteredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favorites.includes(Number(game.id))}
                onToggleFavorite={() => toggle(Number(game.id))}
                onClick={() => navigate(`/games/${game.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
