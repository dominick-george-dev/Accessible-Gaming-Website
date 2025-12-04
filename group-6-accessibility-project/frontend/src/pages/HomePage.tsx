import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import type { Game } from "../types/game";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { applyTheme, applyTextSize, applyDyslexiaFont, applyColorblindFilter } from "../context/AccessibilityContext";

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

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();
    const [favorites, setFavorites] = useState<number[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [topShownCount, setTopShownCount] = useState<number>(3);

  const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

  // Apply accessibility settings on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const prefs = user.accessibilityPreferences;
        if (prefs) {
          applyTheme(prefs.theme, prefs.highContrast);
          applyTextSize(prefs.textSize);
          applyDyslexiaFont(prefs.dyslexiaFont);
          applyColorblindFilter(prefs.colorblindFilter);
        }
      } catch {}
    }
  }, []);

  // Fetch and apply accessibility settings from backend on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
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

  // Fetch user's favorites
  useEffect(() => {
    if (!user) return;    const fetchFavorites = async () => {
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
 
  const handleShowMoreTop = () => {
    setTopShownCount((prev) => Math.min(prev + 3, topRatedAll.length));
  };


  const resolveImageUrl = (g: any): string | null => {
    const candidate =
      g?.coverImage ??
      g?.thumbnail ??
      g?.image ??
      (Array.isArray(g?.images) && (g.images[0]?.url ?? g.images[0])) ??
      g?.background_image ??
      g?.url ??
      g?.src;
    if (!candidate) return null;
    const u = String(candidate);
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("//")) return u;
    return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
  };

  // Updated favorite toggle with backend sync
  const handleToggleFavorite = async (gameId: string) => {
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

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadGames = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/games/getall?page=1&limit=50`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`);
        const payload = await res.json();
        const items = Array.isArray(payload) ? payload : payload?.data ?? [];
        setGames(items);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
    return () => controller.abort();
  }, [API_BASE]);

  // Carousel state + ref
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = games.slice(0, 6); // first 6 as featured

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;
    const left = child.offsetLeft - (container.clientWidth - child.clientWidth) / 2;
    container.scrollTo({ left, behavior: "smooth" });
    setActiveIndex(index);
  };

  const prev = () => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  };
  const next = () => {
    scrollToIndex(Math.min(Math.max(0, featured.length - 1), activeIndex + 1));
  };

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = node.scrollLeft + node.clientWidth / 2;
        let nearest = 0;
        let minDist = Infinity;
        Array.from(node.children).forEach((c, i) => {
          const el = c as HTMLElement;
          const elCenter = el.offsetLeft + el.clientWidth / 2;
          const dist = Math.abs(elCenter - center);
          if (dist < minDist) {
            minDist = dist;
            nearest = i;
          }
        });
        setActiveIndex(nearest);
      });
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [featured.length]);

  const onCarouselKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const getRating = (g: any): number => {
    const r = g?.rating ?? g?.avgRating ?? g?.score ?? g?.rating?.average ?? 0;
    const n = Number(r);
    return Number.isFinite(n) ? n : 0;
  };

  const topRatedAll = games.slice().sort((a, b) => getRating(b as any) - getRating(a as any));
  const displayedTopRated = topRatedAll.slice(0, topShownCount);

  // Updated SlideCard with correct favorite state check
  const SlideCard = ({ game, id }: { game: any; id: string }) => {
    const img = resolveImageUrl(game);
    const numericId = Number(id);
    const isFavorite = favorites.includes(numericId);
    
    return (
      <div
        className="min-w-full flex-shrink-0 snap-center px-4"
        style={{ scrollSnapAlign: "center" }}
      >        <div
          className="relative rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 bg-card border border-border"
          role="group"
          tabIndex={0}
          onClick={() => handleGameClick(id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGameClick(id)}
        >
          {img ? (
            <div className="relative h-64 md:h-72 lg:h-80">
              <img src={img} alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>          ) : (
            <div className="h-64 md:h-72 lg:h-80 bg-muted flex items-center justify-center text-sm text-muted-foreground">No image</div>
          )}

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-base font-semibold truncate">{("name" in game ? (game as any).name : (game as any).title) || "Untitled"}</h4>
                <p className="text-xs text-muted-foreground mt-1 truncate">{Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}</p>
              </div>              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(id); }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                disabled={!user}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{(game as any).shortDescription ?? (game as any).summary ?? ""}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
          <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Welcome to AccessPlay</h2>
          <p className="text-muted-foreground mb-6">
            Discover accessible games designed for everyone. Browse our collection with detailed accessibility information.
          </p>

          {/* Carousel container */}
          <div className="relative">            <button
              aria-label="Previous featured"
              onClick={prev}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-card/90 shadow-md p-2 hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40 border border-border"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div
              ref={carouselRef}
              onKeyDown={onCarouselKeyDown}
              tabIndex={0}
              className="flex gap-6 overflow-x-auto px-0 py-3 snap-x snap-mandatory transition hide-scrollbar"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured games"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loading ? (
                <div className="w-full flex-shrink-0 flex justify-center items-center min-h-[180px]">
                  <div className="text-sm text-muted-foreground">Loading featured…</div>
                </div>
              ) : featured.length === 0 ? (
                <div className="w-full flex-shrink-0 flex justify-center items-center min-h-[180px] text-muted-foreground">No featured games</div>
              ) : (
                featured.map((game) => {
                  const rawId = (game as any).id ?? (game as any)._id ?? (game as any).slug ?? (game as any).title ?? (game as any).name;
                  const id = typeof rawId === "string" ? rawId : String(rawId);
                  return <SlideCard key={id} game={game} id={id} />;
                })
              )}
            </div>            <button
              aria-label="Next featured"
              onClick={next}
              disabled={activeIndex >= Math.max(0, featured.length - 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-card/90 shadow-md p-2 hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40 border border-border"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>            <div className="flex items-center justify-center gap-2 mt-3">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === activeIndex ? "bg-primary scale-110" : "bg-muted-foreground/50"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

        <section
          className="mt-4 bg-gradient-to-br from-primary/10 to-accent rounded-lg p-4 sm:p-6 lg:p-8 space-y-3 lg:space-y-4"
          aria-labelledby="hero-heading"
        >
          <div className="flex items-start gap-3 lg:gap-4">
            <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <div className="space-y-2 lg:space-y-3 flex-1">
              <h1 id="hero-heading">Discover Accessible Games</h1>
              <p className="text-muted-foreground max-w-2xl">
                Find mobile games designed for everyone. Filter by your accessibility needs and play with confidence.
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <Button
              onClick={() => navigate("/browserpage")}
              className="gap-2 sm:w-auto"
              size="lg"
              aria-label="Browse all games"
            >
              Browse Games
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
        </div>
      </div>

      {/* Highest rated games */}
      <div className="px-4 lg:px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Highest rated</h2>
            <div className="flex items-center gap-2">
              {topRatedAll.length > 3 && (
                <Button variant="outline" onClick={handleShowMoreTop} disabled={displayedTopRated.length >= topRatedAll.length}>
                  View more
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8">Loading top rated…</p>
          ) : topRatedAll.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No top rated games yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTopRated.map((game) => {
                const rawId = (game as any).id ?? (game as any)._id ?? (game as any).slug ?? (game as any).title ?? (game as any).name;
                const id = typeof rawId === "string" ? rawId : String(rawId);
                const numericId = Number(id);
                const isFavorite = favorites.includes(numericId);
                const imgSrc = resolveImageUrl(game as any);
                const rating = getRating(game as any);

                return (
                  <Card key={`top-${id}`} className="group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleGameClick(id)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGameClick(id)}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="truncate text-lg font-semibold">{("name" in game ? (game as any).name : (game as any).title) || "Untitled"}</CardTitle>

                      <Button 
                        variant={isFavorite ? "default" : "outline"} 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(id); }} 
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        disabled={!user}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {imgSrc ? (
                        <img src={imgSrc} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`} className="rounded-md w-full h-40 object-cover" />                      ) : (
                        <div className="rounded-md w-full h-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">No image</div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}</p>
                        <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : "—"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}