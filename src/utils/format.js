export const yearOf = (d) => (d?.length ? d.slice(0,4) : "—");
export const toFiveStar = (voteAverage10) => Math.round((voteAverage10/2) * 10) / 10;
