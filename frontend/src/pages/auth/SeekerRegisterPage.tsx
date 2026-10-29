import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function SeekerRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    organisation: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.fullName.trim(),
        role: "seeker",
        organization_name: form.organisation.trim() || undefined,
      });
      setSuccessMessage("Seeker account registered successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/seeker");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create seeker account.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090D] px-4 py-10 text-white">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/login/seeker"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
          <ThemeToggle />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 shadow-2xl sm:p-9">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <UserRound size={28} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            ResourceBridge
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Discover equipment, workspaces, and technical resources shared by
            organisations and individuals.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="seeker-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="seeker-name"
                  autoComplete="name"
                  required
                  disabled={loading || !!successMessage}
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Enter your full name"
                  className={`${inputClass} pl-11 disabled:opacity-60`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="seeker-register-email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="seeker-register-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading || !!successMessage}
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  className={`${inputClass} pl-11 disabled:opacity-60`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="seeker-organisation"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Organisation or business (optional)
              </label>

              <input
                id="seeker-organisation"
                disabled={loading || !!successMessage}
                value={form.organisation}
                onChange={(event) =>
                  updateField("organisation", event.target.value)
                }
                placeholder="Company, startup, institution, or individual"
                className={`${inputClass} disabled:opacity-60`}
              />
            </div>

            <div>
              <label
                htmlFor="seeker-register-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="seeker-register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading || !!successMessage}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="At least 8 characters"
                  className={`${inputClass} pl-11 pr-12 disabled:opacity-60`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="seeker-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>

              <input
                id="seeker-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={loading || !!successMessage}
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                placeholder="Enter your password again"
                className={`${inputClass} disabled:opacity-60`}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-200"
              >
                {error}
              </p>
            )}

            {successMessage && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3.5 text-sm leading-6 text-emerald-300"
              >
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading
                ? "Creating account..."
                : successMessage
                ? "Redirecting..."
                : "Create seeker account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login/seeker"
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
