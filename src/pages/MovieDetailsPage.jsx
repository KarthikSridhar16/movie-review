import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TMDB } from "../app/tmdb";
import { img } from "../utils/image";
import { yearOf, toFiveStar } from "../utils/format";
import StarRating from "../components/StarRating";
import useLocalRatings from "../hooks/useLocalRatings";

function ReadonlyStars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${i < full ? "fill-yellow-400" : "fill-slate-500/40"}`}
        >
          <path d="M10 15.27l-5.18 3.05 1.64-5.64L2 8.63l5.82-.5L10 2.5l2.18 5.63 5.82.5-4.46 4.05 1.64 5.64z" />
        </svg>
      ))}
    </div>
  );
}

/* simple local reviews store */
function useLocalReviews(movieId) {
  const key = "mp.reviews";
  const [list, setList] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const all = raw ? JSON.parse(raw) : {};
      setList(all[movieId] || []);
    } catch {
      setList([]);
    }
  }, [movieId]);

  const save = (next) => {
    setList(next);
    try {
      const raw = localStorage.getItem(key);
      const all = raw ? JSON.parse(raw) : {};
      all[movieId] = next;
      localStorage.setItem(key, JSON.stringify(all));
    } catch {}
  };

  return {
    list,
    add: (r) => save([{ id: Date.now(), ...r }, ...list]),
    remove: (rid) => save(list.filter((x) => x.id !== rid)),
  };
}

export default function MovieDetailsPage() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [keywords, setKeywords] = useState([]); // NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ratings = useLocalRatings();
  const userRating = ratings.get(Number(id));
  const reviews = useLocalReviews(String(id));

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [m, c, v, k] = await Promise.all([
          TMDB.movie(id),
          TMDB.credits(id),
          TMDB.videos(id),
          TMDB.keywords(id),
        ]);
        if (cancel) return;
        setMovie(m);
        setCast((c.cast || []).slice(0, 12));
        const yt = (v.results || []).find(
          (x) => x.site === "YouTube" && (x.type === "Trailer" || x.type === "Teaser")
        );
        setTrailer(yt ? `https://www.youtube.com/watch?v=${yt.key}` : null);
        setKeywords(k.keywords || k.results || []); // TMDB returns {keywords:[...]}
      } catch (e) {
        if (!cancel) setError(e.message || "Failed to load movie");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [id]);

  const bgUrl = useMemo(() => {
    if (!movie) return null;
    return img.backdrop(movie.backdrop_path || movie.poster_path, "w1280");
  }, [movie]);

  const facts = useMemo(() => {
    if (!movie) return "";
    const parts = [];
    if (movie.release_date) parts.push(yearOf(movie.release_date));
    if (movie.runtime) parts.push(minToHM(movie.runtime));
    if (movie.genres?.length) parts.push(movie.genres.map((g) => g.name).join(", "));
    return parts.join(" • ");
  }, [movie]);

  const tmdb5 = useMemo(() => toFiveStar(movie?.vote_average ?? 0), [movie?.vote_average]);

  // Map original_language to a readable name using spoken_languages if available
  const originalLanguageName = useMemo(() => {
    if (!movie?.original_language) return null;
    const code = movie.original_language;
    const match = movie.spoken_languages?.find((l) => l.iso_639_1 === code);
    return match?.english_name || match?.name || code.toUpperCase();
  }, [movie]);

  const contentScore = useMemo(() => computeContentScore(movie, keywords, !!trailer), [movie, keywords, trailer]);

  return (
    <section className="relative space-y-6">
      {bgUrl && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px) brightness(0.75) saturate(1.05)",
              transform: "scale(1.06)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        </div>
      )}

      <Link to="/" className="text-sky-400 hover:underline">← Back</Link>

      {loading && (
        <div className="card p-6 animate-pulse">
          <div className="h-6 w-64 bg-white/10 rounded mb-4" />
          <div className="h-4 w-48 bg-white/10 rounded mb-3" />
          <div className="h-32 w-full bg-white/10 rounded" />
        </div>
      )}
      {error && !loading && <div className="text-red-400">{error}</div>}

      {!loading && movie && (
        <>
          {/* Hero: poster left, content right */}
          <article className="glass rounded-2xl overflow-hidden p-5 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-6 items-start">
              <div className="md:col-span-1">
                <div className="aspect-[2/3] overflow-hidden rounded-xl md:rounded-2xl">
                  <img
                    src={img.poster(movie.poster_path, "w500")}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = img.poster(null); }}
                  />
                </div>
              </div>

              <div className="md:col-span-1 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  {movie.title}{movie.release_date ? ` (${yearOf(movie.release_date)})` : ""}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="badge-soft">TMDB {tmdb5}★</span>
                  {movie.vote_count ? (
                    <span className="muted">{movie.vote_count.toLocaleString()} votes</span>
                  ) : null}
                  {facts && <span className="muted">• {facts}</span>}
                </div>

                {movie.tagline && <p className="italic text-slate-300">“{movie.tagline}”</p>}

                <p className="text-slate-200 leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={trailer || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`btn-pill btn-grad ${!trailer ? "pointer-events-none opacity-60" : ""}`}
                  >
                    ▶︎ Play Trailer
                  </a>
                  {movie.homepage && (
                    <a href={movie.homepage} target="_blank" rel="noreferrer" className="btn-pill btn-ghost-2">
                      Official Site
                    </a>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-sm text-slate-300 mb-1">Your rating</div>
                  <StarRating value={userRating} onChange={(v) => ratings.set(Number(id), v)} />
                </div>
              </div>
            </div>
          </article>

          {/* Facts / Keywords / Content Score */}
          <section className="grid gap-5 lg:grid-cols-3">
            {/* Facts */}
            <div className="card p-5 space-y-3">
              <h3 className="text-lg font-bold">Facts</h3>
              <FactRow label="Status" value={movie.status || "—"} />
              <FactRow label="Original Language" value={originalLanguageName || "—"} />
              <FactRow label="Budget" value={formatCurrency(movie.budget)} />
              <FactRow label="Revenue" value={formatCurrency(movie.revenue)} />
            </div>

            {/* Keywords */}
            <div className="card p-5 space-y-3 lg:col-span-2">
              <h3 className="text-lg font-bold">Keywords</h3>
              {keywords?.length ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((k) => (
                    <span key={k.id} className="chip border border-sky-400/30 text-sky-200">
                      {k.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="muted">No keywords available.</div>
              )}
              <div className="pt-4">
                <h4 className="font-semibold mb-2">Content Score</h4>
                <div className="h-6 rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-pink-400"
                    style={{ width: `${contentScore}%` }}
                  />
                </div>
                <div className="text-sm mt-2">
                  <b>{contentScore}</b> {contentScore >= 80 ? "Yes! Looking good!" : contentScore >= 50 ? "Decent content." : "Needs more info."}
                </div>
              </div>
            </div>
          </section>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="card p-5">
              <h2 className="text-xl font-bold mb-3">Cast</h2>
              <div className="flex gap-4 overflow-x-auto hide-scroll py-1">
                {cast.map((p) => (
                  <div key={p.cast_id || p.credit_id} className="min-w-[96px]">
                    <img
                      src={img.profile(p.profile_path)}
                      alt={p.name}
                      className="w-24 h-24 rounded-full object-cover avatar-ring"
                      onError={(e) => { e.currentTarget.src = img.profile(null); }}
                      title={p.name}
                    />
                    <div className="mt-2 text-sm leading-tight">
                      <div className="font-semibold">{p.name}</div>
                      <div className="muted">{p.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <ReviewsSection movieTitle={movie.title} reviews={reviews} />
        </>
      )}
    </section>
  );
}

function FactRow({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide muted">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function ReviewsSection({ movieTitle, reviews }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(0);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    reviews.add({
      author: name.trim() || "Anonymous",
      text: trimmed,
      stars,
      date: new Date().toISOString(),
    });
    setName(""); setText(""); setStars(0);
  };

  return (
    <section className="card p-5 space-y-4">
      <h2 className="text-xl font-bold">Reviews</h2>

      {reviews.list.length === 0 && (
        <div className="muted">No reviews yet. Be the first to tell others what you think about <b>{movieTitle}</b>.</div>
      )}

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr,220px,120px]">
        <input
          className="glass rounded-xl px-3 py-2 w-full"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-slate-300 mr-3">Your rating</span>
          <StarRating value={stars} onChange={setStars} />
        </div>
        <button className="btn-pill btn-grad w-full md:w-auto" type="submit">Post</button>
        <textarea
          className="glass rounded-xl px-3 py-2 w-full md:col-span-3"
          rows={3}
          placeholder="Write your review..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form>

      {reviews.list.length > 0 && (
        <div className="divide-y divide-white/10">
          {reviews.list.map((r) => (
            <div key={r.id} className="py-4 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center shrink-0">
                {r.author?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{r.author}</div>
                  <div className="text-xs muted">{new Date(r.date).toLocaleString()}</div>
                </div>
                <div className="mt-1"><ReadonlyStars value={r.stars} /></div>
                <p className="mt-2 text-slate-200 whitespace-pre-wrap">{r.text}</p>
              </div>
              <button
                className="text-xs muted hover:text-red-300"
                onClick={() => reviews.remove(r.id)}
                title="Delete review"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function minToHM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function formatCurrency(n) {
  if (!n) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Number(n).toLocaleString()}`;
  }
}

function computeContentScore(m, kws, hasTrailer) {
  if (!m) return 0;
  let score = 0;
  const checks = [
    !!m.poster_path,
    !!m.backdrop_path,
    !!m.overview,
    !!m.runtime,
    (m.genres?.length ?? 0) > 0,
    (kws?.length ?? 0) > 0,
    hasTrailer,
  ];
  score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return score;
}
