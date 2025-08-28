export default function SearchFilters({
  query, setQuery,
  genre, setGenre,
  year, setYear,
  min, setMin,
  genreList, years
}) {
  return (
    <div className="relative z-50">
      <div className="grid md:grid-cols-4 gap-3 items-stretch">
        <input
          className="filter-input w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies by title..."
        />

        <div className="relative">
          <select
            className="filter-select w-full"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genreList.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            className="filter-select w-full"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Any Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="relative">
          <select
            className="filter-select w-full"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>Min {n}★</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
