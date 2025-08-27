const BASE = "https://api.themoviedb.org/3";
const token = import.meta.env.VITE_TMDB_TOKEN;

async function api(path, params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });

  const res = await fetch(`${BASE}${path}?${q.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`TMDB ${res.status}: ${msg}`);
  }
  return res.json();
}

export const TMDB = {
  // lists
  genres: () => api("/genre/movie/list"),
  discover: (params) => api("/discover/movie", params),
  searchMovies: (query, page = 1) =>
    api("/search/movie", { query, page }),
  // details
  movie: (id) => api(`/movie/${id}`),
  credits: (id) => api(`/movie/${id}/credits`),
  videos: (id) => api(`/movie/${id}/videos`),
};
