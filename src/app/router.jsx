import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MovieDetailsPage from "../pages/MovieDetailsPage";

function Shell({ children }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-black tracking-wide">🎬 MoviePoint</div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="py-10 text-center text-sm text-slate-400">
        This product uses the TMDB API but is not endorsed by TMDB.
      </footer>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Shell><HomePage/></Shell> },
  { path: "/movie/:id", element: <Shell><MovieDetailsPage/></Shell> },
]);
