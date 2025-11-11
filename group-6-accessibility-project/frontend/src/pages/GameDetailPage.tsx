import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
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
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AccessibleVideoPlayer } from "../components/AccessibleVideoPlayer";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Game, Review } from "../types/game";
import { useParams, useNavigate } from "react-router-dom";

// Helper function to get category color and icon
const getCategoryStyle = (category: string) => {
    switch (category) {
        case 'Visual':
        return { 
            color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            icon: Eye 
        };
        case 'Hearing':
        return { 
            color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
            icon: Ear 
        };
        case 'Dexterity':
        return { 
            color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
            icon: Hand 
        };
        case 'Cognitive':
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

export function GameDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [game, setGame] = useState<Game | null>(null);
    const [accessibilityTags, setAccessibilityTags] = useState<any[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isHelpful, setIsHelpful] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [selectedAccessibilityTags, setSelectedAccessibilityTags] = useState<
        string[]
    >([]);

    const isLoggedIn = true; // You can hook this up to your auth system later

    useEffect(() => {
        if (!id) return;
        fetchGameDetails(id);
        fetchAccessibilityTags(id);
        fetchReviews(id);
    }, [id]);

    const fetchGameDetails = async (gameId: string) => {
        try {
        const response = await fetch(`http://localhost:3000/games/gameDetails/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch game details");
        const data = await response.json();

        setGame(data);
        setReviews(data.reviews || []);
        } catch (error) {
        console.error("Error fetching game details:", error);
        toast.error("Failed to load game details");
        } finally {
        setLoading(false);
        }
    };

    const fetchAccessibilityTags = async (gameId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/accessibility-tags/game/${gameId}`);
            if (!response.ok) throw new Error("Failed to fetch accessibility tags");
            const data = await response.json();
                setAccessibilityTags(data);
        } catch (error) {
            console.error("Error fetching accessibility tags:", error);
            toast.error("Failed to load accessibility tags");
        }
    };

    const fetchReviews = async (gameId: string) => {
        // Fetch reviews for the game
        try {
            const response = await fetch(`http://localhost:3000/reviews/game/${gameId}`);
            if (!response.ok) throw new Error("Failed to fetch reviews");
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            // Handle error
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load reviews");
        }
    };

    const handleHelpfulSubmit = async (id: number) => {
        const reviewToUpdate = reviews.find((review) => review.id === id);
        if (!reviewToUpdate) {
            toast.error("Review not found");
            return;
        }

        const isCurrentlyHelpful = isHelpful[id] || false;
        const newHelpfulCount = isCurrentlyHelpful
            ? reviewToUpdate.helpful - 1
            : reviewToUpdate.helpful + 1;

        // Optimistic UI update
        setReviews((prevReviews) =>
            prevReviews.map((review) =>
            review.id === id ? { ...review, helpful: newHelpfulCount } : review
            )
        );

        try {
            const response = await fetch(`http://localhost:3000/reviews/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ helpful: newHelpfulCount }),
            });

            if (!response.ok) throw new Error("Failed to update review");

            // Update helpful state for only this review
            setIsHelpful((prev) => ({
            ...prev,
            [id]: !isCurrentlyHelpful,
            }));

            toast.success(
            !isCurrentlyHelpful
                ? "Marked review as helpful!"
                : "Removed helpful vote."
            );
        } catch (err) {
            toast.error("Failed to update review");
        }
        };
    const handleSubmitReview = async () => {
        if (!isLoggedIn) {
        toast.error("Please sign in to submit a review");
        return;
        }

        if (userRating === 0) {
        toast.error("Please select a rating");
        return;
        }

        if (!reviewText.trim()) {
        toast.error("Please write a review");
        return;
        }

        try {
        const res = await fetch(`http://localhost:3000/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            gameId: game?.id,
            userId: 1, // To be implemented with auth system
            userName: "Anonymous", // Replace with actual user name from auth
            rating: userRating,
            comment: reviewText,
            accessibilityFeedback: selectedAccessibilityTags,
            }),
        });

        if (!res.ok) throw new Error("Failed to submit review");
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]);
        toast.success("Review submitted!");

        setUserRating(0);
        setReviewText("");
        setSelectedAccessibilityTags([]);
        } catch (error) {
        toast.error("Error submitting review");
        console.error(error);
        }
    };

    const toggleAccessibilityTag = (tagName: string) => {
        setSelectedAccessibilityTags((prev) =>
        prev.includes(tagName)
            ? prev.filter((t) => t !== tagName)
            : [...prev, tagName]
        );
    };

    const onToggleFavorite = (gameId: string) => {
        setIsFavorite((prev) => !prev);
        toast(isFavorite ? "Removed from favorites" : "Added to favorites");
    };

    const onBack = () => navigate(-1);

    if (loading) return <p className="text-center py-8">Loading...</p>;
    if (!game) return <p className="text-center py-8">Game not found.</p>;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onBack();
        }
    };

    // Google Play Icon Component
    const GooglePlayIcon = () => (
        <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5" 
        fill="currentColor"
        aria-hidden="true"
        >
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
    );

    // Apple Icon Component
    const AppleIcon = () => (
        <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5" 
        fill="currentColor"
        aria-hidden="true"
        >
        <path d="M17.6 13.8c0-3 2.5-4.5 2.6-4.5-1.4-2.1-3.6-2.3-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-4-1-2 0-3.9 1.2-5 3C.1 13.4 1.7 18 3.7 20.6c1 1.3 2.2 2.7 3.8 2.7 1.5 0 2.1-.9 4-1 1.8 0 2.4 1 4 1 1.7 0 2.7-1.3 3.7-2.6 1.2-1.5 1.7-3 1.7-3.1-.1 0-3.2-1.2-3.3-4.8zM14.7 5.4c.8-1 1.4-2.4 1.2-3.8-1.2 0-2.7.8-3.5 1.8-.7.9-1.4 2.3-1.2 3.6 1.3.1 2.6-.6 3.5-1.6z" />
        </svg>
    );

    

    return (
        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
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

        {/* Top Section with Image and Info */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Game Image */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <ImageWithFallback
                src={game.thumbnail}
                alt={`${game.title} game cover`}
                className="w-full h-full object-cover"
            />
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

            {/* Game Info */}
            <div className="space-y-4 lg:space-y-6">
            <div>
                <div className="flex items-start justify-between gap-3 mb-2 lg:mb-3">
                <h1 className="flex-1">{game.title}</h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onToggleFavorite(game.id)}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFavorite}
                    className="flex-shrink-0"
                >
                    <Heart
                    className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                    />
                </Button>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" aria-hidden="true" />
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

            {/* Quick Description - Mobile */}
            <div className="md:hidden">
                <h3 className="mb-2">About</h3>
                <p className="text-muted-foreground">{game.description}</p>
            </div>
            </div>
        </div>
        
        <Separator />
            {/* Full Description */}
            <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="mb-3 lg:mb-4">Detailed Description</h2>
            <p className="text-muted-foreground">{game.description}</p>
            </section>
        <Separator />
        
        {/* Video Trailer */}
        <AccessibleVideoPlayer gameName={game.title} thumbnailUrl={game.thumbnail} />

        

        {/* Accessibility Features */}
        <section aria-labelledby="accessibility-heading">
            <h2 id="accessibility-heading" className="mb-3 lg:mb-4">
            Accessibility Features
            </h2>
            <div className="grid gap-3 lg:gap-4">
            {/* Filtering/Sorting accessibility tags */}
            {['Visual', 'Hearing', 'Dexterity', 'Cognitive'].map((category) => {
                const categoryTags = accessibilityTags.filter(
                (tag) => tag.category === category
                );
                // Skip rendering if no tags found for this category
                if (categoryTags.length === 0) return null;
                // Get category style & icon
                const categoryStyle = getCategoryStyle(category);
                const CategoryIcon = categoryStyle.icon;
                return (
                <Card key={category} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-5 h-5" aria-hidden="true" />
                    <h3 className="capitalize">{category}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {/* Render tags for this category */}
                    {categoryTags.map((tag) => {
                        const style = getCategoryStyle(tag.category);
                        const Icon = style.icon;
                        return (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            className={`gap-1.5 ${style.color}`}
                        >
                            <Icon className="w-3 h-3" aria-hidden="true" />
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

        <Separator />

        {/* Write Review */}
        <section aria-labelledby="write-review-heading">
            <h2 id="write-review-heading" className="mb-3 lg:mb-4">
            Write a Review
            </h2>
            {!isLoggedIn && (
            <Card className="p-4 mb-4 bg-muted">
                <p className="text-muted-foreground">
                Please sign in to write a review for this game.
                </p>
            </Card>
            )}
            <Card className="p-4 lg:p-6 space-y-4">
            <div>
                <label className="block mb-2">Your Rating</label>
                <div className="flex gap-2" role="radiogroup" aria-label="Select rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                    key={rating}
                    onClick={() => setUserRating(rating)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                    role="radio"
                    aria-checked={userRating === rating}
                    >
                    <Star
                        className={`w-8 h-8 ${
                        rating <= userRating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                    />
                    </button>
                ))}
                </div>
            </div>

            <div>
                <label htmlFor="review-text" className="block mb-2">
                Your Review
                </label>
                <Textarea
                id="review-text"
                placeholder="Share your experience with this game's accessibility features..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                aria-describedby="review-hint"
                />
                <p id="review-hint" className="text-muted-foreground mt-2">
                Help others by mentioning specific accessibility features
                </p>
            </div>

            {/* Accessibility Tags Selection */}
            <div>
                <label className="block mb-3">
                Accessibility Features You Experienced (Optional)
                </label>
                <div className="space-y-4">
                {['Visual', 'Hearing', 'Dexterity', 'Cognitive'].map((category) => {
                    const categoryTags = accessibilityTags.filter(
                    (tag) => tag.category === category
                    );
                    if (categoryTags.length === 0) return null;

                    const categoryStyle = getCategoryStyle(category);
                    const CategoryIcon = categoryStyle.icon;

                    return (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4" aria-hidden="true" />
                        <h4 className="capitalize">{category}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryTags.map((tag) => (
                            <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`tag-${tag.id}`}
                                checked={selectedAccessibilityTags.includes(tag.tag)}
                                onCheckedChange={() => toggleAccessibilityTag(tag.tag)}
                                aria-label={`Select ${tag.tag}`}
                            />
                            <label
                                htmlFor={`tag-${tag.id}`}
                                className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {tag.tag}
                            </label>
                            </div>
                        ))}
                        </div>
                        <br/>
                        <Separator/>
                    </div>
                    );
                })}
                </div>
            </div>

            <Button 
                onClick={handleSubmitReview} 
                className="w-full"
                disabled={!isLoggedIn}
            >
                Submit Review
            </Button>
            </Card>
        </section>

        <Separator />

        {/* Reviews */}
        <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="mb-3 lg:mb-4">
            User Reviews
            </h2>
            <div className="space-y-3 lg:space-y-4">
            {
            reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review!
                </p>
            ) : (
                reviews.map((review) => (
                <Card key={review.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                    <div>
                        <p>{review.userName}</p>
                        <div className="flex items-center gap-2 mt-1">
                        <div className="flex" aria-label={`${review.rating} out of 5 stars`}>
                            {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                i < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                                aria-hidden="true"
                            />
                            ))}
                        </div>
                        <span className="text-muted-foreground">
                            
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        </div>
                    </div>
                    </div>

                    <p>{review.comment}</p>

                    {review.accessibilityFeedback.length > 0 && (
                    <div>
                        <p className="text-muted-foreground mb-2">
                        Accessibility features mentioned:
                        </p>
                        <div className="flex flex-wrap gap-2">
                        {review.accessibilityFeedback.map((accessibilityFeature, i) => (
                            <Badge key={i} variant="secondary">
                                {accessibilityFeature}
                            </Badge>
                        ))}
                        </div>
                    </div>
                    )}

                    <Button variant="ghost" size="sm" className={`"gap-2" ${isHelpful[review.id] ? 'text-green-500 border-green-500 bg-green-50' : ''}`} onClick={() => handleHelpfulSubmit(review.id)}>
                    <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                    </Button>
                </Card>
                ))
            )}
            </div>
        </section>
        </div>
    );
}