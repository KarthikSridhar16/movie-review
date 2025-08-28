
const posterPh =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b0f17"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#94a3b8" font-family="system-ui,Segoe UI,Roboto,Arial" text-anchor="middle">
    <text x="200" y="290" font-size="28">No Poster</text>
  </g>
</svg>`);

const profilePh =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <defs>
    <linearGradient id="gp" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b0f17"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gp)"/>
  <circle cx="100" cy="85" r="40" fill="#334155"/>
  <rect x="55" y="135" width="90" height="30" rx="15" fill="#334155"/>
</svg>`);

export const img = {
  poster: (path, size = "w342") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : posterPh,
  backdrop: (path, size = "w780") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : posterPh,
  profile: (path, size = "w185") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : profilePh,
};
