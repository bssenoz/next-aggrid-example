import { useEffect, useState } from "react";
import { Athlete } from "../types/athlete";
import { fetchData, fetchLargeData } from "../store/athleteStore";

export function useAthletes(isLarge: boolean = false) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = isLarge ? await fetchLargeData() : await fetchData();
        setAthletes(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLarge]);

  return { athletes, loading, error };
}
