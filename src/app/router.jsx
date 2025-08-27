import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MovieDetailsPage from "../pages/MovieDetailsPage";
import Header from "../components/Header";

function Shell({ children }) {
  return (
    <div className="min-h-dvh">
      <Header />
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

