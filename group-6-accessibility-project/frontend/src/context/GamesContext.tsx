import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import type { Game } from "../types/game";

interface GamesContextType {
  games: Game[];
  loading: boolean;
  error: string | null;
  reloadGames: () => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/games/getall");

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setGames(Array.isArray(data) ? data : data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch games:", err);
      setError(err.message || "Unknown error");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <GamesContext.Provider value={{ games, loading, error, reloadGames: fetchGames }}>
      {children}
    </GamesContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GamesContext);
  if (!context) throw new Error("useGames must be used within a GamesProvider");
  return context;
}
