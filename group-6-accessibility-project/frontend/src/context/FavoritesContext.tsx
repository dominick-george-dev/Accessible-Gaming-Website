import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type FavoritesContextType = {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggle: (id: string) => void;
};

const API_URL = "http://localhost:3000/favorites";

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children, userId }: { children: ReactNode; userId: number }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from backend
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await fetch(`${API_URL}/${userId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load favorites: ${res.status} ${res.statusText} - ${text}`);
        }
        const data = await res.json();
        setFavorites(data.map((f: any) => f.gameId.toString()));
      } catch (err) {
        console.error("Error loading favorites:", err);
        setFavorites([]);
      }
    };
    if (userId) loadFavorites();
  }, [userId]);

  // Toggle favorite
  const toggle = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, gameId: parseInt(id) }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to toggle favorite: ${res.status} ${res.statusText} - ${text}`);
      }

      setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const addFavorite = (id: string) => {
    if (!favorites.includes(id)) toggle(id);
  };

  const removeFavorite = (id: string) => {
    if (favorites.includes(id)) toggle(id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
