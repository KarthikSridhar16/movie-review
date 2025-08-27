import { Link, useParams } from "react-router-dom";

export default function MovieDetailsPage() {
  const { id } = useParams();
  return (
    <article className="space-y-4">
      <Link to="/" className="text-sky-400 hover:underline">← Back</Link>
      <div className="card p-5">
        <h1 className="text-2xl font-bold">Movie Details #{id}</h1>
        <p className="text-slate-300">Poster, overview, cast & trailer come next.</p>
      </div>
    </article>
  );
}
