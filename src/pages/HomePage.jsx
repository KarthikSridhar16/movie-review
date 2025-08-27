import { useEffect, useMemo, useState } from "react";
import { TMDB } from "../app/tmdb";
import useDebouncedValue from "../hooks/useDebouncedValue";
import MovieCard from "../components/MovieCard";
import SearchFilters from "../components/SearchFilters";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 500);

  const [genreList, setGenreList] = useState([]);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [min, setMin] = useState(0);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // load genres once
  useEffect(() => {
    TMDB.genres().then(r => setGenreList(r.genres || [])).catch(() => {});
  }, []);

  // list or search whenever inputs change
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = debounced
          ? await TMDB.searchMovies(debounced, page)
          : await TMDB.discover({
              page,
              sort_by: "popularity.desc",
              ...(genre ? { with_genres: genre } : {}),
              ...(year ? { primary_release_year: year } : {}),
              ...(min  ? { "vote_average.gte": min * 2 } : {}), // our 1..5 → TMDB 0..10
            });
        if (!cancel) {
          setMovies(res.results || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (e) {
        if (!cancel) setError(e.message || "Failed to load");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [debounced, genre, year, min, page]);

  // reset to page 1 whenever inputs (except page) change
  useEffect(() => { setPage(1); }, [debounced, genre, year, min]);

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, i) => cur - i);
  }, []);

  return (
    <section className="space-y-6">
      <div className="card p-5">
        <h1 className="text-2xl font-bold">Browse</h1>
        <p className="text-slate-300">Live TMDB data with search + filters.</p>
      </div>

      <SearchFilters
        query={query} setQuery={setQuery}
        genre={genre} setGenre={setGenre}
        year={year} setYear={setYear}
        min={min} setMin={setMin}
        genreList={genreList} years={years}
      />

      {error && <div className="text-red-400">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) =>
              <div key={i} className="card h-[320px] animate-pulse" />)
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>

      <div className="flex justify-center items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-40">
          Prev
        </button>
        <div className="text-sm text-slate-400">Page {page} / {totalPages}</div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-40">
          Next
        </button>
      </div>
    </section>
  );
}
