import { useCallback, useMemo, useState } from "react";
const KEY = "user_ratings_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

export default function useLocalRatings() {
  const [map, setMap] = useState(() => read());
  const set = useCallback((id, val) => {
    setMap(prev => {
      const next = { ...prev };
      if (val == null) delete next[id];
      else next[id] = val; // 1..5
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return useMemo(() => ({
    get: (id) => map[id] ?? null,
    set,
    all: map
  }), [map, set]);
}
