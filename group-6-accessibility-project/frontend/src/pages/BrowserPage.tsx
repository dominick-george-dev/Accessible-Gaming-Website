import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../types/game';
import { GameCard } from '../components/GameCard';
import { FilterPanel } from '../components/FilterPanel';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { applyTheme, applyTextSize, applyDyslexiaFont, applyColorblindFilter } from '../context/AccessibilityContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState({
    visual: false,
    hearing: false,
    dexterity: false,
    cognitive: false,
  });
  const [, setLoading] = useState(true);
  const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

  // Fetch user's favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_BASE}/favorites/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const gameIds = data.map((fav: any) => fav.gameId);
          setFavorites(gameIds);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [user, API_BASE]);

  useEffect(() => {
    const storedSearches = localStorage.getItem('accessplay_recent_searches');
    if (storedSearches) setRecentSearches(JSON.parse(storedSearches));

    const loadGames = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/games/getall');
        if (!res.ok) throw new Error('Failed to fetch games');
        const data = await res.json();
        if (Array.isArray(data)) setGames(data);
        else if (Array.isArray(data.games)) setGames(data.games);
        else if (Array.isArray(data.data)) setGames(data.data);
        else setGames([]);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load games');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  useEffect(() => {
    // Fetch and apply accessibility settings from backend on mount
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    const fetchAndApplyPrefs = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/accessibility-settings/${parsedUser.id}`);
        let prefs;
        if (response.ok) {
          prefs = await response.json();
        } else {
          prefs = parsedUser.accessibilityPreferences;
        }
        if (prefs) {
          applyTheme(prefs.theme, prefs.highContrast);
          applyTextSize(prefs.textSize);
          applyDyslexiaFont(prefs.dyslexiaFont);
          applyColorblindFilter(prefs.colorblindFilter);
        }
      } catch (error) {
        // fallback to localStorage prefs
        const prefs = parsedUser.accessibilityPreferences;
        if (prefs) {
          applyTheme(prefs.theme, prefs.highContrast);
          applyTextSize(prefs.textSize);
          applyDyslexiaFont(prefs.dyslexiaFont);
          applyColorblindFilter(prefs.colorblindFilter);
        }
      }
    };
    fetchAndApplyPrefs();
  }, []);

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  // Updated favorite toggle with backend sync
  const toggleFavorite = async (gameId: string) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    const numericGameId = Number(gameId);
    const previousFavoriteState = favorites.includes(numericGameId);

    // Optimistic update
    setFavorites(prev => 
      prev.includes(numericGameId) 
        ? prev.filter(id => id !== numericGameId)
        : [...prev, numericGameId]
    );

    try {
      const response = await fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, gameId: numericGameId }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update state based on backend response
        if (result.added) {
          setFavorites(prev => prev.includes(numericGameId) ? prev : [...prev, numericGameId]);
          toast.success('Added to favorites!');
        } else {
          setFavorites(prev => prev.filter(id => id !== numericGameId));
          toast.success('Removed from favorites');
        }
      } else {
        throw new Error('Failed to update favorite');
      }
    } catch (error) {
      // Revert optimistic update on error
      setFavorites(prev => 
        previousFavoriteState 
          ? [...prev, numericGameId]
          : prev.filter(id => id !== numericGameId)
      );
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const saveToRecentSearches = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('accessplay_recent_searches', JSON.stringify(updated));
  };



  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => ({ ...prev, [category]: checked }));
  };

  const activeFilterCount = Object.values(selectedCategories).filter(Boolean).length;

  const filteredGames = useMemo(() => {
    if (!Array.isArray(games)) return [];
    const selectedCats = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([cat]) => cat.toLowerCase());

    return games.filter(game => {
      const title = game.title ?? '';
      const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];
      const genres = Array.isArray(game.genre) ? game.genre : [];
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        q === '' ||
        title.toLowerCase().includes(q) ||
        genres.some(g => (g ?? '').toLowerCase().includes(q)) ||
        tags.some(tag => (tag?.name ?? '').toLowerCase().includes(q));

      const matchesAccessibility =
        selectedCats.length === 0 ||
        tags.some(tag => {
          const cat = (tag?.category ?? '').toLowerCase();
          return selectedCats.includes(cat);
        });

      return matchesSearch && matchesAccessibility;
    });
  }, [games, searchQuery, selectedCategories]);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    if (!Array.isArray(games)) return [];
    const query = searchQuery.toLowerCase();
    const matches: string[] = [];
    games.forEach(game => {
      const title = game.title ?? "";
      const genres = Array.isArray(game.genre) ? game.genre : [];
      const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];
      if (title.toLowerCase().includes(query) && !matches.includes(title)) matches.push(title);
      genres.forEach(g => {
        const gLower = (g ?? "").toLowerCase();
        if (gLower.includes(query) && !matches.includes(g)) matches.push(g);
      });
      tags.forEach(tag => {
        const tagName = tag?.name ?? "";
        if (tagName.toLowerCase().includes(query) && !matches.includes(tagName)) matches.push(tagName);
      });
    });
    return matches.slice(0, 5);
  }, [games, searchQuery]);

  return (
      <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Filters */}
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
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true"/>
              <Input
                type="search"
                placeholder="Search games, genres, or features..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) saveToRecentSearches(searchQuery.trim()); }}
                className="pl-10 w-full"
              />

              {showSuggestions && (suggestions.length > 0 || (searchQuery.length === 0 && recentSearches.length > 0)) && (
                <Card className="absolute top-full mt-1 w-full z-50 p-2">
                  {/* Recent Searches */}
                  {searchQuery.length === 0 && recentSearches.map((recent, idx) => (
                    <button key={idx} onClick={() => { setSearchQuery(recent); saveToRecentSearches(recent); }} className="w-full text-left px-3 py-2 hover:bg-muted rounded">{recent}</button>
                  ))}
                  {/* Suggestions */}
                  {suggestions.map((s, idx) => (
                    <button key={idx} onClick={() => { setSearchQuery(s); saveToRecentSearches(s); }} className="w-full text-left px-3 py-2 hover:bg-muted rounded">{s}</button>
                  ))}
                </Card>
              )}
            </div>

            {/* Results */}
            <div>
              <p className="text-muted-foreground mb-4 lg:mb-6" aria-live="polite" aria-atomic="true">
                Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
              </p>
           {filteredGames.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p>No games found matching your criteria</p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategories({ visual:false, hearing:false, dexterity:false, cognitive:false }); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">                  {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(Number(game.id))}
                    onToggleFavorite={() => toggleFavorite(game.id.toString())}
                    onClick={() => handleGameClick(game.id.toString())}
                  />
                ))}
              </div>
            )}          
          </div>        
        </div>
      </div>
    </div>
    </div>
  );
}
