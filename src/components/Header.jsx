import { NavLink } from "react-router-dom";

const link =
  "px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition";
const active = "bg-white/10 text-white";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <div className="shrink-0 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-fuchsia-400 to-pink-500 grid place-items-center">
            <span className="text-xs font-black text-black">🎬</span>
          </div>
          <div className="text-lg font-extrabold tracking-wide">KS_MoviePoint</div>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={({isActive}) => `${link} ${isActive?active:""}`}>Home</NavLink>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className={link}>TMDB</a>
          <a href="https://github.com/KarthikSridhar16/movie-review.git" target="_blank" rel="noreferrer" className={link}>GitHub</a>
        </nav>

        <div className="ml-auto">
          <span className="text-xs text-slate-400">Welcome, Guest</span>
        </div>
      </div>
    </header>
  );
}
