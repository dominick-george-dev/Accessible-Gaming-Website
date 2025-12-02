import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { useUser } from "./UserContext";

interface FavoritesContextType {
  favorites: number[];
  toggle: (gameId: number) => void;
  loading: boolean;
  error: string | null;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!user) {
    setFavorites([]);
    setLoading(false);
    setError(null);
    return;
  }

  let cancelled = false;

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/favorites/${user.id}`);

      if (!res.ok) {
        if (res.status === 404) {
          // No favorites yet
          if (!cancelled) setFavorites([]);
          return;
        }
        throw new Error(`HTTP error ${res.status}`);
      }

      const json = await res.json();

      if (!cancelled) {
        // Make sure favorites is always a number array
        setFavorites(
          Array.isArray(json.data)
            ? json.data.map((f: any) => Number(f.gameId ?? f.id ?? f))
            : []
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch favorites:", err);
      if (!cancelled) {
        setFavorites([]);
        setError(err.message || "Unknown error");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  loadFavorites();

  return () => {
    cancelled = true;
  };
}, [user]);

  const toggle = async (gameId: number) => {
    if (!user) return;

    try {
      const action = favorites.includes(gameId) ? "remove" : "add";

     const res = await fetch(`http://localhost:3000/favorites/toggle`, {
      method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ userId: user.id, gameId }),
    });

      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);

      setFavorites(prev =>
        action === "add" ? [...prev, gameId] : prev.filter(id => id !== gameId)
      );
    } catch (err: any) {
      console.error("Toggle favorite failed:", err);
      setError(err.message || "Failed to update favorite");
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, loading, error }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
}
