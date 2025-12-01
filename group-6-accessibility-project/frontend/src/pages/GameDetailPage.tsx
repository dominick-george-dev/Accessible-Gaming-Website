import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import type { Game } from '../types/game';
import { GameCard } from '../components/GameCard';
import { toast } from 'sonner';

export function GameDetailPage() {
  // useParams with generic to ensure TypeScript knows gameId exists
  const params = useParams<{ gameId: string }>();
  const gameIdParam = params.gameId;

  const { favorites, toggle } = useFavorites();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameIdParam) return;

    const loadGame = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/games/${gameIdParam}`);
        if (!res.ok) throw new Error('Failed to fetch game');
        const json = await res.json();
        setGame(json.data ?? null);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load game');
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameIdParam]);

  if (loading) return <p className="text-center py-12">Loading game...</p>;
  if (!game) return <p className="text-center py-12">Game not found</p>;

  // ✅ Convert game.id to number to match FavoritesContext type
  const gameId = Number(game.id);
  const isFavorite = favorites.includes(gameId);

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <GameCard
        game={game}
        isFavorite={isFavorite}
        onToggleFavorite={() => toggle(gameId)}
        onClick={() => {}}
      />
      {/* Additional game details can be rendered here */}
    </div>
  );
}
