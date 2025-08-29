import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TMDB } from "../app/tmdb";
import { img } from "../utils/image";
import { compact, toFiveStar } from "../utils/format";

function StarRow({ value5 }) {
  const full = Math.round(value5);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${
            i < full ? "fill-yellow-400" : "fill-slate-500/40"
          }`}
        >
          <path d="M10 15.27l-5.18 3.05 1.64-5.64L2 8.63l5.82-.5L10 2.5l2.18 5.63 5.82.5-4.46 4.05 1.64 5.64z" />
        </svg>
      ))}
    </div>
  );
}

export default function HeroCarousel({
  movies = [],
  onActiveBg,
  paused = false,
}) {
  const looped = useMemo(() => {
    if (movies.length <= 1) return movies;
    return [movies[movies.length - 1], ...movies, movies[0]];
  }, [movies]);

  const [pos, setPos] = useState(looped.length > 1 ? 1 : 0);

  const sectionRef = useRef(null);
  const scroller = useRef(null);
  const autoRef = useRef(null);
  const visibleRef = useRef(true);
  const hoveringRef = useRef(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    updateAuto();
  }, [paused]);

  const realIndex = useMemo(() => {
    if (!movies.length) return 0;
    return (pos - 1 + movies.length) % movies.length;
  }, [pos, movies.length]);

  const activeMovie = movies[realIndex];

  useEffect(() => {
    if (!activeMovie) return;
    const url = img.backdrop(
      activeMovie.backdrop_path || activeMovie.poster_path,
      "w1280"
    );
    onActiveBg?.(url);
  }, [activeMovie, onActiveBg]);

  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  useEffect(() => {
    if (!activeMovie) return;
    let cancel = false;
    (async () => {
      try {
        const [c, v] = await Promise.all([
          TMDB.credits(activeMovie.id),
          TMDB.videos(activeMovie.id),
        ]);
        if (cancel) return;
        setCast((c.cast || []).slice(0, 8));
        const yt = (v.results || []).find(
          (x) => x.site === "YouTube" && x.type === "Trailer"
        );
        setTrailer(yt ? `https://www.youtube.com/watch?v=${yt.key}` : null);
      } catch {}
    })();
    return () => {
      cancel = true;
    };
  }, [activeMovie]);

  const ANIM_MS = 450;
  const scrollTo = (i, smooth = true) => {
    const el = scroller.current?.children?.[i];
    if (el)
      el.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        inline: "center",
        block: "nearest",
      });
  };

  useEffect(() => {
    const startPos = looped.length > 1 ? 1 : 0;
    setPos(startPos);
    setTimeout(() => scrollTo(startPos, false), 0);
  }, [looped.length]);

  const next = () => {
    setPos((p) => {
      const np = p + 1;
      scrollTo(np);
      if (looped.length > 1 && np === looped.length - 1) {
        setTimeout(() => {
          const realFirst = 1;
          scrollTo(realFirst, false);
          setPos(realFirst);
        }, ANIM_MS);
      }
      return np;
    });
  };
  const prev = () => {
    setPos((p) => {
      const np = p - 1;
      scrollTo(np);
      if (looped.length > 1 && np === 0) {
        setTimeout(() => {
          const realLast = looped.length - 2;
          scrollTo(realLast, false);
          setPos(realLast);
        }, ANIM_MS);
      }
      return np;
    });
  };

  const start = () => {
    if (!autoRef.current) autoRef.current = setInterval(next, 5000);
  };
  const stop = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = null;
  };
  const updateAuto = () => {
    if (
      !pausedRef.current &&
      visibleRef.current &&
      !hoveringRef.current &&
      document.visibilityState === "visible"
    )
      start();
    else stop();
  };

  useEffect(() => {
    const node = scroller.current;

    const onEnter = () => {
      hoveringRef.current = true;
      updateAuto();
    };
    const onLeave = () => {
      hoveringRef.current = false;
      updateAuto();
    };
    node?.addEventListener("mouseenter", onEnter);
    node?.addEventListener("mouseleave", onLeave);

    const onVis = () => updateAuto();
    document.addEventListener("visibilitychange", onVis);

    const el = sectionRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current =
          entry.isIntersecting && entry.intersectionRatio > 0.25;
        updateAuto();
      },
      { threshold: [0, 0.25, 0.5] }
    );
    if (el) io.observe(el);

    updateAuto();

    return () => {
      stop();
      node?.removeEventListener("mouseenter", onEnter);
      node?.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, [looped.length]);

  const posterSrc = (m) =>
    m?.poster_path
      ? img.poster(m.poster_path, "w500")
      : img.backdrop(m.backdrop_path, "w780");

  return (
    <section ref={sectionRef} className="relative rounded-[28px]">
      <div
        ref={scroller}
        className="flex gap-6 overflow-x-auto hide-scroll scroll-snap-x carousel-pad p-2"
      >
        {looped.map((m, i) => {
          const isActive = i === pos;
          const rating5 = toFiveStar(m.vote_average || 0);
          return (
            <div
              key={`${m.id}_${i}`}
              className={`snap-center shrink-0 hero-w slide ${
                isActive ? "slide--active" : "slide--side"
              }`}
              onMouseEnter={() => setPos(i)}
              onFocus={() => setPos(i)}
            >
              <div className="hero-h rounded-3xl">
                <div className="flex h-full flex-col md:flex-row">
                  <div className="relative overflow-hidden rounded-t-3xl md:rounded-t-none md:rounded-l-3xl md:rounded-r-none w-full md:basis-[360px] lg:basis-[440px] hero-poster-h md:h-auto">
                    <img
                      src={posterSrc(m)}
                      alt={m.title}
                      loading="lazy"
                      className="block w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = img.poster(null);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  <div className="relative flex-1 min-w-0 w-full rounded-b-3xl md:rounded-b-none md:rounded-r-3xl">
                    <div className="pointer-events-none absolute inset-0 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl bg-black/35 backdrop-blur-sm" />
                    <div className="relative p-5 sm:p-6 lg:p-7 space-y-3">
                      <h2 className="text-[22px] sm:text-2xl lg:text-[26px] font-extrabold truncate">
                        {m.title}
                      </h2>

                      <div className="flex items-center gap-3 text-sm">
                        <StarRow value5={rating5} />
                        <span className="text-slate-300">
                          {compact(m.vote_count)} voters
                        </span>
                      </div>

                      <p className="text-slate-200 leading-relaxed text-[14px] sm:text-[15px] line-clamp-5 md:line-clamp-4">
                        {m.overview || "No overview available."}
                      </p>

                      {isActive && (
                        <div>
                          <div className="text-base font-semibold mb-2">
                            Cast
                          </div>
                          <div className="flex items-center gap-3 overflow-x-auto hide-scroll pr-1">
                            {cast.slice(0, 7).map((p) => (
                              <img
                                key={p.cast_id || p.credit_id}
                                src={img.profile(p.profile_path)}
                                alt={p.name}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover avatar-ring shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = img.profile(null);
                                }}
                                title={p.name}
                              />
                            ))}
                            {cast.length > 7 && (
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full grid place-items-center border border-pink-400/40 text-pink-300 text-xs shrink-0">
                                {`${cast.length - 7}+`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-1 flex flex-col sm:flex-row gap-3">
                        <a
                          href={trailer || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className={`btn-pill btn-grad w-full sm:w-auto text-center ${
                            !trailer ? "pointer-events-none opacity-60" : ""
                          }`}
                        >
                          ▶︎ Play Now
                        </a>
                        <Link
                          to={`/movie/${m.id}`}
                          className="btn-pill btn-ghost-2 w-full sm:w-auto text-center text-white"
                        >
                          Watch Trailer
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none">
        <div className="hidden md:flex justify-between">
          <button
            className="pointer-events-auto mx-1 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 grid place-items-center"
            onClick={prev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="pointer-events-auto mx-1 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 grid place-items-center"
            onClick={next}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
