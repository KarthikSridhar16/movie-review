import { useEffect, useMemo, useRef, useState } from "react";
import { TMDB } from "../app/tmdb";
import useDebouncedValue from "../hooks/useDebouncedValue";
import MovieCard from "../components/MovieCard";
import SearchFilters from "../components/SearchFilters";
import NavTabs from "../components/NavTabs";
import HeroCarousel from "../components/HeroCarousel";

const UI_PAGE_SIZE = 24;
const TMDB_PAGE_SIZE = 20;

export default function HomePage() {
  const [pageBg, setPageBg] = useState(null);
  const [heroBg, setHeroBg] = useState(null);
  const [hoveringGrid, setHoveringGrid] = useState(false);

  const [hero, setHero] = useState([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      const res = await TMDB.discover({
        "primary_release_date.lte": new Date().toISOString().slice(0, 10),
        sort_by: "primary_release_date.desc",
        include_adult: false,
        page: 1,
        "vote_count.gte": 30,
      });
      if (cancel) return;
      const cleaned = (res.results || [])
        .filter((m) => m.poster_path || m.backdrop_path)
        .slice(0, 8);
      setHero(cleaned);
      if (cleaned[0]) {
        const firstBg =
          "https://image.tmdb.org/t/p/w1280" +
          (cleaned[0].backdrop_path || cleaned[0].poster_path);
        setHeroBg(firstBg);
        setPageBg(firstBg);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const handleHeroBg = (url) => {
    setHeroBg(url);
    if (!hoveringGrid) setPageBg(url);
  };

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

  useEffect(() => {
    TMDB.genres()
      .then((r) => setGenreList(r.genres || []))
      .catch(() => {});
  }, []);

  async function fetchDiscover24(base, uiPage) {
    const start = (uiPage - 1) * UI_PAGE_SIZE;
    const tmdbPage1 = Math.floor(start / TMDB_PAGE_SIZE) + 1;
    const offset = start % TMDB_PAGE_SIZE;

    const first = await TMDB.discover({ ...base, page: tmdbPage1 });
    let combined = (first.results || []).slice();
    let need = offset + UI_PAGE_SIZE;

    let p = tmdbPage1;
    while (combined.length < need && p < (first.total_pages || 1)) {
      p += 1;
      const next = await TMDB.discover({ ...base, page: p });
      combined = combined.concat(next.results || []);
    }

    const slice = combined.slice(offset, offset + UI_PAGE_SIZE);
    const totalResults =
      first.total_results ?? first.total_pages * TMDB_PAGE_SIZE;
    return {
      results: slice,
      totalPages: Math.max(1, Math.ceil(totalResults / UI_PAGE_SIZE)),
    };
  }

  async function fetchSearch24(q, uiPage) {
    const start = (uiPage - 1) * UI_PAGE_SIZE;
    const tmdbPage1 = Math.floor(start / TMDB_PAGE_SIZE) + 1;
    const offset = start % TMDB_PAGE_SIZE;

    const first = await TMDB.searchMovies(q, tmdbPage1);
    let combined = (first.results || []).slice();
    let need = offset + UI_PAGE_SIZE;

    let p = tmdbPage1;
    while (combined.length < need && p < (first.total_pages || 1)) {
      p += 1;
      const next = await TMDB.searchMovies(q, p);
      combined = combined.concat(next.results || []);
    }

    const slice = combined.slice(offset, offset + UI_PAGE_SIZE);
    const totalResults =
      first.total_results ?? first.total_pages * TMDB_PAGE_SIZE;
    return {
      results: slice,
      totalPages: Math.max(1, Math.ceil(totalResults / UI_PAGE_SIZE)),
    };
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (debounced) {
          const { results, totalPages } = await fetchSearch24(debounced, page);
          if (!cancel) {
            setMovies(results || []);
            setTotalPages(totalPages);
          }
        } else {
          const today = new Date().toISOString().slice(0, 10);
          const baseParams = {
            sort_by: tab === "top" ? "vote_average.desc" : "popularity.desc",
            ...(tab === "upcoming"
              ? { "primary_release_date.gte": today }
              : {}),
            ...(tab === "now" ? { "primary_release_date.lte": today } : {}),
            ...(genre ? { with_genres: genre } : {}),
            ...(year ? { primary_release_year: year } : {}),
            ...(min
              ? { "vote_average.gte": min * 2, "vote_count.gte": 50 }
              : {}),
          };

          const { results, totalPages } = await fetchDiscover24(
            baseParams,
            page
          );
          if (!cancel) {
            setMovies(results || []);
            setTotalPages(totalPages);
          }
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

  useEffect(() => {
    setPage(1);
  }, [debounced, genre, year, min, tab]);

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, i) => cur - i);
  }, []);

  const heroRef = useRef(null);
  const [heroInView, setHeroInView] = useState(true);
  useEffect(() => {
    if (!heroRef.current) return;
    const ob = new IntersectionObserver(
      ([entry]) =>
        setHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    ob.observe(heroRef.current);
    return () => ob.disconnect();
  }, [heroRef.current]);

  const bgFrom = (m) =>
    "https://image.tmdb.org/t/p/w1280" +
    (m.backdrop_path || m.poster_path || "");

  return (
    <section className="relative space-y-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: pageBg ? `url(${pageBg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(14px) brightness(0.9) saturate(1.05)",
            transform: "scale(1.04)",
          }}
        />
      </div>

      <div ref={heroRef}>
        {hero.length > 0 && (
          <HeroCarousel
            movies={hero}
            onActiveBg={handleHeroBg}
            paused={!heroInView || hoveringGrid}
          />
        )}
      </div>

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

      {!debounced && <NavTabs tab={tab} setTab={setTab} />}

      {error && <div className="text-red-400">{error}</div>}

      <div
        onPointerEnter={() => setHoveringGrid(true)}
        onPointerLeave={() => {
          setHoveringGrid(false);
          if (heroBg) setPageBg(heroBg);
        }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4"
      >
        {loading
          ? Array.from({ length: UI_PAGE_SIZE }).map((_, i) => (
              <div key={i} className="card h-[320px] animate-pulse" />
            ))
          : movies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onHoverBg={() => setPageBg(bgFrom(m))}
              />
            ))}
      </div>

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
