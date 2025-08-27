// src/app/tmdb.js
const BASE = "https://api.themoviedb.org/3";

// Trim in case Netlify value has stray spaces/newlines
const TOKEN = (import.meta.env.VITE_TMDB_TOKEN ?? "").trim();

if (!TOKEN) {
  // This will show up in Netlify’s production console if the token is missing
  console.error(
    "[TMDB] Missing VITE_TMDB_TOKEN. " +
    "On Netlify set it in Site settings → Build & deploy → Environment."
  );
}

function buildUrl(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function api(path, params = {}) {
  const res = await fetch(buildUrl(path, params), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (res.status === 401) {
    const body = await res.text();
    // Helpful one-time diagnostics without exposing the token
    console.error(
      "[TMDB] 401 Unauthorized.",
      { hasToken: Boolean(TOKEN), tokenLength: TOKEN.length, path }
    );
    throw new Error(`TMDB 401: ${body}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB ${res.status}: ${body}`);
  }
  return res.json();
}

export const TMDB = {
  // lists
  genres: () => api("/genre/movie/list"),
  discover: (params) => api("/discover/movie", params),
  searchMovies: (query, page = 1) => api("/search/movie", { query, page }),

  // details
  movie: (id) => api(`/movie/${id}`),
  credits: (id) => api(`/movie/${id}/credits`),
  videos: (id) => api(`/movie/${id}/videos`),
};
