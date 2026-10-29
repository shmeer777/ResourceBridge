import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090D] px-6 text-white">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <Compass className="h-8 w-8 text-cyan-400" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
          ResourceBridge
        </p>

        <h1 className="text-7xl font-extrabold tracking-tight sm:text-8xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold">
          This page doesn't exist
        </h2>

        <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-400">
          The page you're looking for may have moved or may not be available
          yet. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-slate-950 transition hover:brightness-110"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>
      </div>
    </main>
  );
}