import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { FavoritesContext } from "../context/FavoritesContext.tsx";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { ImgCarousel } from "../components/ui/imgCarousel";
import { AccessibleVideoPlayer } from "../components/AccessibleVideoPlayer";

import { ArrowLeft, Star, Heart, Check, Eye, Ear, Hand, Brain } from "lucide-react";
import { addUndoAction } from "../utils/undoManager";

import type { Game, Review } from "../types/game";

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Visual": return { color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800", icon: Eye };
    case "Hearing": return { color: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800", icon: Ear };
    case "Dexterity": return { color: "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800", icon: Hand };
    case "Cognitive": return { color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800", icon: Brain };
    default: return { color: "bg-secondary text-secondary-foreground", icon: Check };
  }
};

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const favoritesContext = useContext(FavoritesContext);
  if (!favoritesContext) throw new Error("FavoritesContext must be used inside FavoritesProvider");

  const { favorites, toggle } = favoritesContext;

  const [game, setGame] = useState<Game | null>(null);
  const [accessibilityTags, setAccessibilityTags] = useState<{ id: string; tag: string; category: string; verified: boolean }[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const isFavorite = game ? favorites.includes(game.id.toString()) : false;

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchGameDetails(id), fetchAccessibilityTags(id), fetchReviews(id)]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, favorites]);

  const fetchGameDetails = async (gameId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/games/gameDetails/${gameId}`);
      if (!res.ok) throw new Error("Failed to fetch game details");
      const data = await res.json();
      setGame(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load game details");
    }
  };

  const fetchAccessibilityTags = async (gameId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/accessibility-tags/game/${gameId}`);
      if (!res.ok) throw new Error("Failed to fetch accessibility tags");
      const data = await res.json();
      setAccessibilityTags(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load accessibility tags");
    }
  };

  const fetchReviews = async (gameId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/reviews/game/${gameId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reviews");
    }
  };

  const onBack = () => navigate(-1);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBack();
    }
  };

  const onToggleFavorite = () => {
    if (!game) return;
    toggle(game.id.toString());
    addUndoAction(isFavorite ? "Remove from favorites" : "Add to favorites", () => toggle(game.id.toString()));
    toast(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!game) return <p className="text-center py-8">Game not found.</p>;

  return (
    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl space-y-6 lg:space-y-8">
        <Button variant="ghost" onClick={onBack} onKeyDown={handleKeyDown} aria-label="Go back" className="gap-2" size="sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Browse</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <ImgCarousel images={game.images} alt={`${game.title} cover`} />
            {game.verified && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full px-3 py-1 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Verified</span>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2 lg:mb-3">
                <h1 className="flex-1">{game.title}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={isFavorite}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center gap-3 lg:gap-4 flex-wrap mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span>{game.rating}</span>
                  <span className="text-muted-foreground">({reviews.length})</span>
                </div>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="flex gap-2 flex-wrap">
                  {game.genre.map(genre => <Badge key={genre} variant="outline">{genre}</Badge>)}
                </div>
              </div>

              <p className="text-muted-foreground"><strong>Developer:</strong> {game.developer}</p>
            </div>
          </div>
        </div>

        <Separator />

        <section aria-labelledby="description-heading">
          <h2 id="description-heading" className="mb-3 lg:mb-4">Detailed Description</h2>
          <p className="text-muted-foreground">{game.description}</p>
        </section>

        <Separator />

        <AccessibleVideoPlayer gameName={game.title} youtubeUrl={game.trailer} transcript={game.transcript} />

        <section aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="mb-3 lg:mb-4">Accessibility Features</h2>
          <div className="grid gap-3 lg:gap-4">
            {["Visual", "Hearing", "Dexterity", "Cognitive"].map(category => {
              const categoryTags = accessibilityTags.filter(t => t.category === category);
              if (categoryTags.length === 0) return null;
              const { icon: CategoryIcon } = getCategoryStyle(category);
              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-5 h-5" />
                    <h3 className="capitalize">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map(tag => {
                      const { color, icon: Icon } = getCategoryStyle(tag.category);
                      return (
                        <Badge key={tag.id} variant="outline" className={`gap-1.5 ${color}`}>
                          <Icon className="w-3 h-3" />
                          {tag.verified && <Check className="w-3 h-3" aria-label="Verified" />}
                          {tag.tag}
                        </Badge>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
