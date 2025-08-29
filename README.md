MoviePoint
============

A clean, responsive movie browser powered by the TMDB API, built with Vite + React + Tailwind.

Note: This product uses the TMDB API but is not endorsed or certified by TMDB.


Features
--------
- Cinematic hero carousel (auto-pauses off-screen/hover).
- Dynamic page backdrop that updates with the hero slide and on card hover.
- Debounced search + filters (genre, year, minimum rating).
- 24-card grid per page (stitches TMDB’s 20-item pages seamlessly).
- Movie details page: poster + facts, overview, trailer, cast slider.
- Local ratings & reviews (saved in localStorage).


Tech
----
- React 18, Vite, Tailwind CSS
- react-router-dom
- Custom hooks: useDebouncedValue, useLocalRatings


Setup
-----
1) Install
   npm i

2) Create a TMDB v4 token (Account → Settings → API).
   Add it to a .env file in the project root:

   VITE_TMDB_TOKEN=eyJhbGciOiJI...   # TMDB v4 read token (JWT)

3) Run
   npm run dev

4) Build
   npm run build
   npm run preview


Deploy (Netlify)
----------------
- Build command: npm run build
- Publish directory: dist/
- Environment variable: VITE_TMDB_TOKEN  (your TMDB v4 token)

If you see TMDB 401 after deploy, double-check:
- The variable name is exactly VITE_TMDB_TOKEN
- The value is the v4 auth token (long JWT), not the v3 key
- You redeployed after adding the variable


Project Structure (minimal)
---------------------------
src/
  app/tmdb.js
  components/
    HeroCarousel.jsx
    MovieCard.jsx
    NavTabs.jsx
    SearchFilters.jsx
    StarRating.jsx
  hooks/
    useDebouncedValue.js
    useLocalRatings.js
  pages/
    HomePage.jsx
    MovieDetailsPage.jsx
  utils/
    format.js
    image.js
  styles/        # optional extras


Scripts
-------
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview dist locally


Notes
-----
- The 24-item grid aggregates results across TMDB pages to keep pagination consistent.
- Ratings/reviews are client-only and stored in the browser.
