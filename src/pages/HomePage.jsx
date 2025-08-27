import { useEffect, useMemo, useState } from "react";
import { TMDB } from "../app/tmdb";
import useDebouncedValue from "../hooks/useDebouncedValue";
import MovieCard from "../components/MovieCard";
import SearchFilters from "../components/SearchFilters";
import NavTabs from "../components/NavTabs";
import HeroCarousel from "../components/HeroCarousel";

export default function HomePage() {
  /* ---------- Page-wide dynamic background ---------- */
  const [pageBg, setPageBg] = useState(null);

  /* ---------- HERO (latest releases) ---------- */
  const [hero, setHero] = useState([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      const res = await TMDB.discover({
        "primary_release_date.lte": new Date().toISOString().slice(0, 10),
        sort_by: "primary_release_date.desc",
        include_adult: false,
        page: 1,
        "vote_count.gte": 30, // avoid “0 voters”
      });
      if (cancel) return;
      const cleaned = (res.results || [])
        .filter((m) => m.poster_path || m.backdrop_path)
        .slice(0, 8);
      setHero(cleaned);
      // set initial page background
      if (cleaned[0]) {
        const firstBg =
          "https://image.tmdb.org/t/p/w1280" +
          (cleaned[0].backdrop_path || cleaned[0].poster_path);
        setPageBg(firstBg);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  /* ---------- Search + filters for grid ---------- */
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 500);

  const [genreList, setGenreList] = useState([]);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [min, setMin] = useState(0);

  const [tab, setTab] = useState("now");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // genres list
  useEffect(() => {
    TMDB.genres()
      .then((r) => setGenreList(r.genres || []))
      .catch(() => {});
  }, []);

  // grid fetcher
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (debounced) {
          res = await TMDB.searchMovies(debounced, page);
        } else {
          // base by tab
          if (tab === "now")
            res = await TMDB.discover({
              page,
              sort_by: "popularity.desc",
              "primary_release_date.lte": new Date().toISOString().slice(0, 10),
            });
          if (tab === "upcoming")
            res = await TMDB.discover({
              page,
              sort_by: "popularity.desc",
              "primary_release_date.gte": new Date().toISOString().slice(0, 10),
            });
          if (tab === "top")
            res = await TMDB.discover({
              page,
              sort_by: "vote_average.desc",
              "vote_count.gte": 200,
            });
          if (tab === "popular")
            res = await TMDB.discover({ page, sort_by: "popularity.desc" });

          // apply filters
          res = await TMDB.discover({
            page,
            sort_by: tab === "top" ? "vote_average.desc" : "popularity.desc",
            ...(tab === "upcoming"
              ? { "primary_release_date.gte": new Date().toISOString().slice(0, 10) }
              : {}),
            ...(tab === "now"
              ? { "primary_release_date.lte": new Date().toISOString().slice(0, 10) }
              : {}),
            ...(genre ? { with_genres: genre } : {}),
            ...(year ? { primary_release_year: year } : {}),
            ...(min ? { "vote_average.gte": min * 2, "vote_count.gte": 50 } : {}),
          });
        }
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
    return () => {
      cancel = true;
    };
  }, [debounced, genre, year, min, tab, page]);

  // reset page on inputs change
  useEffect(() => {
    setPage(1);
  }, [debounced, genre, year, min, tab]);

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, i) => cur - i);
  }, []);

  return (
    <section className="relative space-y-8">
      {/* Page-wide dynamic background (no gray overlay) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: pageBg ? `url(${pageBg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // lighter touch so artwork is visible
            filter: "blur(14px) brightness(0.9) saturate(1.05)",
            transform: "scale(1.04)",
          }}
        />
      </div>

      {/* HERO (sends active backdrop up to set pageBg) */}
      {hero.length > 0 && <HeroCarousel movies={hero} onActiveBg={setPageBg} />}

      {/* Search + Filters */}
      <SearchFilters
        query={query}
        setQuery={setQuery}
        genre={genre}
        setGenre={setGenre}
        year={year}
        setYear={setYear}
        min={min}
        setMin={setMin}
        genreList={genreList}
        years={years}
      />

      {/* Tabs */}
      {!debounced && <NavTabs tab={tab} setTab={setTab} />}

      {/* Grid */}
      {error && <div className="text-red-400">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card h-[320px] animate-pulse" />
            ))
          : movies.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-40"
        >
          Prev
        </button>
        <div className="text-sm text-slate-400">
          Page {page} / {totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}
