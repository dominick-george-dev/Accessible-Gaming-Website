import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../types/game';
import { GameCard } from '../components/GameCard';
import { FilterPanel } from '../components/FilterPanel';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Card } from '../components/ui/card';
import { Search, Filter, Clock, X } from 'lucide-react';
import { toast } from "sonner";

const RECENT_SEARCHES_KEY = 'accessplay_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function BrowsePage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState({
    visual: false,
    hearing: false,
    dexterity: false,
    cognitive: false,
  });
  const [loading, setLoading] = useState(true);

  // Load recent searches and games on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (storedSearches) setRecentSearches(JSON.parse(storedSearches));

    const loadGames = async () => {
      setLoading(true);
      try {
        // Use relative path so Vite proxy forwards to backend
        const res = await fetch('/games/getall');
        if (!res.ok) throw new Error('Failed to fetch games');
        const data: Game[] = await res.json();
        setGames(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load games');
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);
  // Navigate to game detail page
  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  // Save/remove favorites locally
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      return updated;
    });
  };

  // Save search to recent searches
  const saveToRecentSearches = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => ({ ...prev, [category]: checked }));
  };

  const activeFilterCount = Object.values(selectedCategories).filter(Boolean).length;

  // Filter games based on search and accessibility categories
 const filteredGames = useMemo(() => {
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

    const selectedCats = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([cat]) => cat);

    const matchesAccessibility =
      selectedCats.length === 0 ||
      selectedCats.every(cat =>
        tags.some(tag => tag?.category === cat)
      );

    return matchesSearch && matchesAccessibility;
  });
}, [games, searchQuery, selectedCategories]);


  // Generate search suggestions (autocomplete)
  const suggestions = useMemo(() => {
  if (searchQuery.length < 2) return [];
  const query = searchQuery.toLowerCase();
  const matches: string[] = [];

  games.forEach(game => {
    const title = game.title ?? "";
    const genres = Array.isArray(game.genre) ? game.genre : [];
    const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];

    if (title.toLowerCase().includes(query) && !matches.includes(title)) {
      matches.push(title);
    }

    genres.forEach(g => {
      const gLower = (g ?? "").toLowerCase();
      if (gLower.includes(query) && !matches.includes(g)) {
        matches.push(g);
      }
    });

    tags.forEach(tag => {
      const tagName = tag?.name ?? "";
      if (tagName.toLowerCase().includes(query) && !matches.includes(tagName)) {
        matches.push(tagName);
      }
    });
  });
  return matches.slice(0, 5);
}, [games, searchQuery]);  return (    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                    onClick={() => handleGameClick(game.id)}
                  />
                ))}
              </div>
            )}          </div>        </div>
      </div>
    </div>
    </div>
  );
}
