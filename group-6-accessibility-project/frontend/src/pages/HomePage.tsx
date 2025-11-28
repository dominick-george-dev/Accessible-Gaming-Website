import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import type { Game } from "../types/game";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

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

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadGames = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/games/getall?page=1&limit=12`;
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
    // ensure the slide is centered in the viewport of the carousel
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

  // update activeIndex on manual scroll
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

  // keyboard navigation for carousel
  const onCarouselKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  // Modern slide card style helper
  const SlideCard = ({ game, id }: { game: any; id: string }) => {
    const img = resolveImageUrl(game);
    return (
      <div
        // each slide fills the carousel viewport
        className="min-w-full flex-shrink-0 snap-center px-4"
        style={{ scrollSnapAlign: "center" }}
      >
        <div
          className="relative rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 bg-gradient-to-b from-white/80 to-white/60"
          role="group"
          tabIndex={0}
          onClick={() => handleGameClick(id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGameClick(id)}
        >
          {img ? (
            <div className="relative h-64 md:h-72 lg:h-80">
              <img src={img} alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="h-64 md:h-72 lg:h-80 bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">No image</div>
          )}

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-base font-semibold truncate">{("name" in game ? (game as any).name : (game as any).title) || "Untitled"}</h4>
                <p className="text-xs text-muted-foreground mt-1 truncate">{Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(id); }}
                aria-label={favorites.includes(id) ? "Remove from favorites" : "Add to favorites"}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Heart className={`w-5 h-5 ${favorites.includes(id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
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
          <div className="relative">
            {/* Arrows */}
            <button
              aria-label="Previous featured"
              onClick={prev}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-md p-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
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
                featured.map((game, i) => {
                  const rawId = (game as any).id ?? (game as any)._id ?? (game as any).slug ?? (game as any).title ?? (game as any).name;
                  const id = typeof rawId === "string" ? rawId : String(rawId);
                  return <SlideCard key={id} game={game} id={id} />;
                })
              )}
            </div>

            <button
              aria-label="Next featured"
              onClick={next}
              disabled={activeIndex >= Math.max(0, featured.length - 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-md p-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* indicators */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === activeIndex ? "bg-primary scale-110" : "bg-gray-300"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="px-4 lg:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="sr-only">Browse Accessible Games</h1>

          {loading ? (
            <p className="text-center py-8">Loading games…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => {
                const rawId = (game as any).id ?? (game as any)._id ?? (game as any).slug ?? (game as any).title ?? (game as any).name;
                const id = typeof rawId === "string" ? rawId : String(rawId);
                const isFavorite = favorites.includes(id);
                const imgSrc = resolveImageUrl(game as any);

                return (
                  <Card key={id} className="group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleGameClick(id)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGameClick(id)}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="truncate text-lg font-semibold">{("name" in game ? (game as any).name : (game as any).title) || "Untitled"}</CardTitle>

                      <Button variant={isFavorite ? "default" : "outline"} size="icon" onClick={(e) => { e.stopPropagation(); handleToggleFavorite(id); }} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {imgSrc ? (
                        <img src={imgSrc} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} alt={`${("name" in game ? (game as any).name : (game as any).title) || "Game"} cover`} className="rounded-md w-full h-40 object-cover" />
                      ) : (
                        <div className="rounded-md w-full h-40 bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">No image</div>
                      )}

                      <p className="text-sm text-muted-foreground truncate">{Array.isArray((game as any).genre) ? (game as any).genre.join(", ") : (game as any).genre}</p>

                      <div className="flex flex-wrap gap-2">
                        {((game as any).accessibilityTags || []).map((tag: any) => (
                          <span key={tag.id ?? tag.name ?? tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag.name ?? tag.label ?? tag.tag}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && games.length === 0 && <p className="text-center text-muted-foreground py-10">No games found.</p>}
        </div>
      </div>
    </>
  );
}