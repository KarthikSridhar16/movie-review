export const yearOf = (d) => (d?.length ? d.slice(0,4) : "—");
export const toFiveStar = (voteAverage10) => Math.round((voteAverage10/2) * 10) / 10;
export const compact = (n) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
    .format(n || 0);
