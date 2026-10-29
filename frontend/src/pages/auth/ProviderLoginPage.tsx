import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Building2, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function ProviderLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        email,
        password,
        role: "provider",
      });
      navigate("/provider");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090D] px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/role-selection"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 shadow-2xl sm:p-9">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <Building2 size={28} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            ResourceBridge
          </p>

          <h1 className="mt-3 text-3xl font-bold">Provider login</h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to manage your organisation and shared resources.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="provider-email" className="mb-2 block text-sm font-medium text-slate-300">
                Work email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090D] px-4 focus-within:border-cyan-400/60">
                <Mail size={18} className="shrink-0 text-slate-500" />

                <input
                  id="provider-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="provider-password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090D] px-4 focus-within:border-cyan-400/60">
                <Lock size={18} className="shrink-0 text-slate-500" />

                <input
                  id="provider-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-slate-500 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to ResourceBridge?{" "}
            <Link to="/register/provider" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Create an account
            </Link>
          </p>

          <button
            type="button"
            onClick={() => navigate("/role-selection")}
            className="mt-5 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
          >
            Choose a different account type
          </button>
        </div>
      </div>
    </main>
  );
}
