import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import useLocalRatings from "../hooks/useLocalRatings";
import { img } from "../utils/image";
import { yearOf, toFiveStar } from "../utils/format";

/** expects a TMDB-like shape */
export default function MovieCard({ movie }) {
  const ratings = useLocalRatings();
  const user = ratings.get(movie.id);
  const tmdb5 = toFiveStar(movie.vote_average ?? 0);

  return (
    <div className="card overflow-hidden flex flex-col">
      <Link to={`/movie/${movie.id}`} className="aspect-[2/3] bg-black/30">
        <img
  src={img.poster(movie.poster_path)}
  alt={movie.title}
  className="w-full h-full object-cover"
  onError={(e) => { e.currentTarget.src = img.poster(null); }}
/>
      </Link>
      <div className="p-3 space-y-2">
        <div className="text-sm text-slate-400">{yearOf(movie.release_date)}</div>
        <h3 className="font-semibold leading-tight line-clamp-2">{movie.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">TMDB {tmdb5}★</span>
          {user && <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/30">You {user}★</span>}
        </div>
        <StarRating value={user} onChange={(v)=>ratings.set(movie.id, v)} />
      </div>
    </div>
  );
}
