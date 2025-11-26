import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { ImgCarousel } from "../components/ui/imgCarousel";
import { AccessibleVideoPlayer } from "../components/AccessibleVideoPlayer";

import {
  ArrowLeft,
  Star,
  Heart,
  Check,
  ThumbsUp,
  Eye,
  Ear,
  Hand,
  Brain,
} from "lucide-react";

import { addUndoAction } from "../utils/undoManager";
import { useFavorites } from "../hooks/useFavorites.tsx";

import type { Game, Review } from "../types/game";

// Helper to get category styling
const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Visual":
      return {
        color:
          "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        icon: Eye,
      };
    case "Hearing":
      return {
        color:
          "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
        icon: Ear,
      };
    case "Dexterity":
      return {
        color:
          "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: Hand,
      };
    case "Cognitive":
      return {
        color:
          "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
        icon: Brain,
      };
    default:
      return { color: "bg-secondary text-secondary-foreground", icon: Check };
  }
};

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [game, setGame] = useState<Game | null>(null);
  const [accessibilityTags, setAccessibilityTags] = useState<
    { id: string; tag: string; category: string; verified: boolean }[]
  >([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHelpful, setIsHelpful] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedAccessibilityTags, setSelectedAccessibilityTags] = useState<
    string[]
  >([]);

  const isLoggedIn = true; // Replace with real auth state

  // Load game data
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchGameDetails(id),
          fetchAccessibilityTags(id),
          fetchReviews(id),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Fetch functions
  const fetchGameDetails = async (gameId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/games/gameDetails/${gameId}`
      );
      if (!res.ok) throw new Error("Failed to fetch game details");
      const data = await res.json();
      setGame(data);
      setIsFavorite(favorites.includes(data.id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load game details");
    }
  };

  const fetchAccessibilityTags = async (gameId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/accessibility-tags/game/${gameId}`
      );
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

  // Handlers
  const onBack = () => navigate(-1);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBack();
    }
  };

  const onToggleFavorite = () => {
    const previousState = isFavorite;
    setIsFavorite((prev) => !prev);

    if (previousState) removeFavorite(game?.id || "");
    else addFavorite(game?.id || "");

    addUndoAction(
      `${!previousState ? "Add to" : "Remove from"} favorites`,
      () => setIsFavorite(previousState)
    );

    toast(previousState ? "Removed from favorites" : "Added to favorites");
  };

  const toggleAccessibilityTag = (tagName: string) => {
    const prev = [...selectedAccessibilityTags];
    setSelectedAccessibilityTags((prevState) =>
      prevState.includes(tagName)
        ? prevState.filter((t) => t !== tagName)
        : [...prevState, tagName]
    );

    addUndoAction(
      `${prev.includes(tagName) ? "Remove" : "Add"} accessibility tag: ${tagName}`,
      () => setSelectedAccessibilityTags(prev)
    );
  };

  const handleHelpfulSubmit = async (id: number) => {
    const review = reviews.find((r) => r.id === id);
    if (!review) return toast.error("Review not found");

    const currentlyHelpful = isHelpful[id] || false;
    const newCount = currentlyHelpful ? review.helpful - 1 : review.helpful + 1;

    const prevCount = review.helpful;
    const prevState = currentlyHelpful;

    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: newCount } : r))
    );

    try {
      const res = await fetch(`http://localhost:3000/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful: newCount }),
      });
      if (!res.ok) throw new Error("Failed to update review");

      setIsHelpful((prev) => ({ ...prev, [id]: !currentlyHelpful }));

      addUndoAction(
        `${!currentlyHelpful ? "Mark" : "Unmark"} review as helpful`,
        () => {
          setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, helpful: prevCount } : r))
          );
          setIsHelpful((prev) => ({ ...prev, [id]: prevState }));
          fetch(`http://localhost:3000/reviews/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ helpful: prevCount }),
          }).catch(() => toast.error("Failed to undo helpful vote"));
        }
      );

      toast(!currentlyHelpful ? "Marked review as helpful!" : "Removed helpful vote");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update review");
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) return toast.error("Please sign in to submit a review");
    if (userRating === 0) return toast.error("Please select a rating");
    if (!reviewText.trim()) return toast.error("Please write a review");
    if (reviews.find((r) => r.userId === 1))
      return toast.error("You have already submitted a review");

    try {
      const res = await fetch(`http://localhost:3000/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game?.id,
          userId: 1,
          userName: "Anonymous",
          rating: userRating,
          comment: reviewText,
          accessibilityFeedback: selectedAccessibilityTags,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      const newReview = await res.json();
      const prevReviews = reviews;

      setReviews((prev) => [...prev, newReview]);

      addUndoAction("Submit review", () => {
        setReviews(prevReviews);
        fetch(`http://localhost:3000/reviews/${newReview.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }).catch(() => toast.error("Failed to undo review submission"));
      });

      toast.success("Review submitted!");
      setUserRating(0);
      setReviewText("");
      setSelectedAccessibilityTags([]);
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review");
    }
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!game) return <p className="text-center py-8">Game not found.</p>;

  // Icons
  const GooglePlayIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );

  const AppleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M17.6 13.8c0-3 2.5-4.5 2.6-4.5-1.4-2.1-3.6-2.3-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-4-1-2 0-3.9 1.2-5 3C.1 13.4 1.7 18 3.7 20.6c1 1.3 2.2 2.7 3.8 2.7 1.5 0 2.1-.9 4-1 1.8 0 2.4 1 4 1 1.7 0 2.7-1.3 3.7-2.6 1.2-1.5 1.7-3 1.7-3.1-.1 0-3.2-1.2-3.3-4.8zM14.7 5.4c.8-1 1.4-2.4 1.2-3.8-1.2 0-2.7.8-3.5 1.8-.7.9-1.4 2.3-1.2 3.6 1.3.1 2.6-.6 3.5-1.6z" />
    </svg>
  );

  return (
    <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl space-y-6 lg:space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          onKeyDown={handleKeyDown}
          aria-label="Go back to browse"
          className="gap-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Browse</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Top Section */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <ImgCarousel images={game.images} alt={`${game.title} cover`} />
            {game.verified && (
              <div
                className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full px-3 py-1 flex items-center gap-2"
                role="status"
                aria-label="Verified accessible game"
              >
                <Check className="w-4 h-4" />
                <span>Verified</span>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:space-y-6">
            {/* Game Info */}
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
                  {game.genre.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">
                <strong>Developer:</strong> {game.developer}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                size="lg"
              >
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${game.title} from Google Play Store`}
                  className="gap-2"
                >
                  <GooglePlayIcon />
                  <span>Google Play</span>
                </a>
              </Button>
              <Button
                asChild
                className="flex-1 bg-black hover:bg-gray-800 text-white dark:bg-gray-900 dark:hover:bg-gray-950"
                size="lg"
              >
                <a
                  href="https://apps.apple.com/us/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${game.title} from Apple App Store`}
                  className="gap-2"
                >
                  <AppleIcon />
                  <span>App Store</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Detailed Description */}
        <section aria-labelledby="description-heading">
          <h2 id="description-heading" className="mb-3 lg:mb-4">
            Detailed Description
          </h2>
          <p className="text-muted-foreground">{game.description}</p>
        </section>

        <Separator />

        {/* Video */}
        <AccessibleVideoPlayer
          gameName={game.title}
          youtubeUrl={game.trailer}
          transcript={game.transcript}
        />

        {/* Accessibility Features */}
        <section aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="mb-3 lg:mb-4">
            Accessibility Features
          </h2>
          <div className="grid gap-3 lg:gap-4">
            {["Visual", "Hearing", "Dexterity", "Cognitive"].map((category) => {
              const categoryTags = accessibilityTags.filter((t) => t.category === category);
              if (categoryTags.length === 0) return null;
              const { icon: CategoryIcon } = getCategoryStyle(category);
              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-5 h-5" />
                    <h3 className="capitalize">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => {
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
