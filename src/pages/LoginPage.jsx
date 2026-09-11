import { Link } from "react-router-dom";
export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-clay-50">
      <div className="w-full max-w-sm rounded-xl border border-dashed border-clay-300 bg-white p-8 text-center">
        <p className="font-display text-lg text-ink-900">Login / Signup</p>
        <p className="mt-2 text-sm text-ink-400">Member 1: build the real form + Google Sign-In here.</p>
        <Link to="/categories" className="mt-6 inline-block rounded-lg bg-ochre-500 px-4 py-2 text-sm font-medium text-white hover:bg-ochre-600">
          Continue (temporary link)
        </Link>
      </div>
    </div>
  );
}