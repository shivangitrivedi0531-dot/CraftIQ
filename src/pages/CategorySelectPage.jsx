import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/categories";

export default function CategorySelectPage() {
  return (
    <div className="min-h-screen bg-clay-50 px-6 py-16">
      <p className="text-center font-display text-2xl text-ink-900">Choose your craft</p>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/dashboard/${c.id}`} className="rounded-xl border border-clay-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
            <p className="font-display text-lg text-ink-900">{c.label}</p>
            <p className="mt-1 text-xs text-ink-400">{c.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}