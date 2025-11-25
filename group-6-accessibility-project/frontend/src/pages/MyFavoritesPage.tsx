import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../types/game';
import { GameCard } from '../components/GameCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { useFavorites } from '../hooks/useFavorites'; // <-- Use the shared favorites hook

export function MyFavoritesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const { favorites, removeFavorite } = useFavorites(); // <-- Use context for favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch('http://localhost:3000/games/getall');
        if (!res.ok) throw new Error('Failed to fetch games');
        const data: Game[] = await res.json();
        setGames(data);
      } catch (err) {
        toast.error('Failed to load games');
        setGames([]);
      }
    };
    loadGames();
  }, []);

  // Only show favorited games
  const favoriteGames = games.filter(game => favorites.includes(game.id));

  // Search suggestions for favorites
  const suggestions = favoriteGames
    .filter(game => searchQuery.length >= 2 && game.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(game => game.title ?? '')
    .slice(0, 5);

  // Filtered favorites based on search
  const filteredGames = favoriteGames.filter(game => {
    const title = game.title ?? '';
    const genres = Array.isArray(game.genre) ? game.genre : [];
    const tags = Array.isArray(game.accessibilityTags) ? game.accessibilityTags : [];
    const q = searchQuery.toLowerCase();

    return (
      q === '' ||
      title.toLowerCase().includes(q) ||
      genres.some(g => (g ?? '').toLowerCase().includes(q)) ||
      tags.some(tag => (tag?.name ?? '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl">
        <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true"/>
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
                  <button key={idx} onClick={() => setSearchQuery(s)} className="w-full text-left px-3 py-2 hover:bg-muted rounded">{s}</button>
                ))}
              </Card>
            )}
          </div>
        </div>
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p>You haven't added any games to your favorites yet. Start browsing to find games you love!</p>
            <Button onClick={() => navigate('/browserpage')}>Browse Games</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {filteredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(game.id)}
                onClick={() => navigate(`/games/${game.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}