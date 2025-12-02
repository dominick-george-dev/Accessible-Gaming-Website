import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Game } from "../types/game";
import { GameCard } from "../components/GameCard";
import { FilterPanel } from "../components/FilterPanel";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";

type Categories = {
  visual: boolean;
  hearing: boolean;
  dexterity: boolean;
  cognitive: boolean;
};

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

export function BrowsePage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [games, setGames] = useState<Game[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Categories>({
    visual: false,
    hearing: false,
    dexterity: false,
    cognitive: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Fetch user's favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      try {
        const response = await fetch(`http://localhost:3000/favorites/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const gameIds = data.map((fav: any) => fav.gameId);
          setFavorites(gameIds);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Load games
  useEffect(() => {
    const cached = sessionStorage.getItem("allGames");
    if (cached) {
      setGames(JSON.parse(cached));
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadGames = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/games/getall");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        if (!cancelled) {
          setGames(list);
          sessionStorage.setItem("allGames", JSON.stringify(list));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error("Failed to load games");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadGames();
    return () => { cancelled = true; };
  }, []);

  // Toggle favorite
  const handleToggleFavorite = async (gameId: number) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, gameId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.added) {
          setFavorites(prev => [...prev, gameId]);
          toast.success('Added to favorites!');
        } else {
          setFavorites(prev => prev.filter(id => id !== gameId));
          toast.success('Removed from favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Category filter handler
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category as keyof Categories]: checked,
    }));
  };

  const activeFilterCount = Object.values(selectedCategories).filter(Boolean).length;

  // Filtered games
  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const selectedCats = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([cat]) => cat.toLowerCase());

    return games.filter(game => {
      const title = game.title ?? "";
      const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];
      const genres = Array.isArray(game.genre) ? game.genre : [];

      const matchesSearch =
        q === "" ||
        title.toLowerCase().includes(q) ||
        genres.some(g => (g ?? "").toLowerCase().includes(q)) ||
        tags.some(tag => (tag?.name ?? "").toLowerCase().includes(q));

      const matchesAccessibility =
        selectedCats.length === 0 ||
        tags.some(tag => selectedCats.includes((tag?.category ?? "").toLowerCase()));

      return matchesSearch && matchesAccessibility;
    });
  }, [games, searchQuery, selectedCategories]);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return games
      .map(game => game.title ?? "")
      .filter(title => title.toLowerCase().includes(q))
      .slice(0, 5);
  }, [games, searchQuery]);

  if (loading || loadingFavorites) return <p className="text-center py-12">Loading games...</p>;

  return (
    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6 min-w-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search games, genres, or features..."
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

            {/* Games */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {filteredGames.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p>No games found matching your criteria</p>
                  <Button
                    onClick={() =>
                      setSelectedCategories({
                        visual: false,
                        hearing: false,
                        dexterity: false,
                        cognitive: false,
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredGames.map(game => (
                  <GameCard
                    key={Number(game.id)}
                    game={game}
                    isFavorite={favorites.includes(Number(game.id))}
                    onToggleFavorite={() => handleToggleFavorite(Number(game.id))}
                    onClick={() => navigate(`/games/${game.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}