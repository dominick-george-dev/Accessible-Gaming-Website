import { Game } from '../types/game';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Heart, Check, Eye, Ear, Hand, Brain } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  onClick: () => void;
}

// Helper function to get category color and icon
const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'visual':
      return { 
        color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        icon: Eye 
      };
    case 'hearing':
      return { 
        color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
        icon: Ear 
      };
    case 'dexterity':
      return { 
        color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        icon: Hand 
      };
    case 'cognitive':
      return { 
        color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        icon: Brain 
      };
    default:
      return { 
        color: 'bg-secondary text-secondary-foreground',
        icon: Check 
      };
  }
};

export function GameCard({ game, isFavorite, onToggleFavorite, onClick }: GameCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleFavorite(game.id);
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${game.name}, ${game.rating} stars, ${game.reviewCount} reviews`}
    >
      <div className="relative aspect-video bg-muted">
        <ImageWithFallback
          src={game.thumbnail}
          alt={`${game.name} game thumbnail`}
          className="w-full h-full object-cover"
        />
        {game.verified && (
          <div
            className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1"
            aria-label="Verified accessible game"
          >
            <Check className="w-4 h-4" />
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          onKeyDown={handleFavoriteKeyDown}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`}
          />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="mb-1">{game.name}</h3>
          <p className="text-muted-foreground line-clamp-2">{game.description}</p>
        </div>

        <div className="flex items-center gap-2" aria-label={`Rating: ${game.rating} out of 5 stars`}>
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
          <span>{game.rating}</span>
          <span className="text-muted-foreground">({game.reviewCount})</span>
        </div>

        <div className="flex flex-wrap gap-2" role="list" aria-label="Accessibility features">
          {game.accessibilityTags.slice(0, 3).map((tag) => {
            const style = getCategoryStyle(tag.category);
            const Icon = style.icon;
            return (
              <Badge
                key={tag.id}
                variant="outline"
                className={`gap-1.5 ${style.color}`}
                role="listitem"
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {tag.name}
              </Badge>
            );
          })}
          {game.accessibilityTags.length > 3 && (
            <Badge variant="outline" role="listitem">
              +{game.accessibilityTags.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}