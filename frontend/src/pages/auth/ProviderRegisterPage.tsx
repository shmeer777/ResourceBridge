import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../../components/common/ThemeToggle";

export const ORGANISATION_TYPES = [
  "School",
  "College / University",
  "Training Institute",
  "Startup",
  "Small Business",
  "Medium / Large Business",
  "Hospital / Healthcare Institution",
  "Research Laboratory",
  "Government Institution",
  "Non-Profit Organisation / NGO",
  "Manufacturing / Industrial Organisation",
  "Coworking Space",
  "Other",
] as const;

export type OrganisationType = typeof ORGANISATION_TYPES[number];

export const ORGANISATION_FIELD_CONFIG: Record<
  string,
  { label: string; placeholder: string }
> = {
  "School": {
    label: "School name",
    placeholder: "e.g., Oakridge International School",
  },
  "College / University": {
    label: "College or university name",
    placeholder: "e.g., Stanford University or MIT",
  },
  "Training Institute": {
    label: "Institute name",
    placeholder: "e.g., Advanced Technology Training Institute",
  },
  "Startup": {
    label: "Startup name",
    placeholder: "e.g., NextGen BioTech Labs",
  },
  "Small Business": {
    label: "Business name",
    placeholder: "e.g., Precision Instruments Co.",
  },
  "Medium / Large Business": {
    label: "Company name",
    placeholder: "e.g., Quantum Precision Systems Corp.",
  },
  "Hospital / Healthcare Institution": {
    label: "Hospital or institution name",
    placeholder: "e.g., St. Jude Medical Research Center",
  },
  "Research Laboratory": {
    label: "Laboratory name",
    placeholder: "e.g., BioFab Innovations Lab",
  },
  "Government Institution": {
    label: "Government department or institution name",
    placeholder: "e.g., National Science & Technology Council",
  },
  "Non-Profit Organisation / NGO": {
    label: "Organisation name",
    placeholder: "e.g., Global Health Access Foundation",
  },
  "Manufacturing / Industrial Organisation": {
    label: "Company or facility name",
    placeholder: "e.g., MicroFab Industrial Facility",
  },
  "Coworking Space": {
    label: "Coworking space name",
    placeholder: "e.g., Innovation Hub Workspace",
  },
  "Other": {
    label: "Organisation name",
    placeholder: "e.g., Organisation name",
  },
};

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    organisationType: "",
    organisationName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const currentOrgConfig = form.organisationType
    ? ORGANISATION_FIELD_CONFIG[form.organisationType] || {
        label: "Organisation name",
        placeholder: "Your company or institution",
      }
    : {
        label: "Organisation name",
        placeholder: "Your company or institution",
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.organisationType) {
      setError("Please select an organisation type.");
      return;
    }

    if (!form.organisationName.trim()) {
      setError(`Please enter your ${currentOrgConfig.label.toLowerCase()}.`);
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your work email.");
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
        role: "provider",
        organization_name: form.organisationName.trim(),
        organization_type: form.organisationType,
      });
      setSuccessMessage("Provider account registered successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/provider");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create provider account.");
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
            to="/login/provider"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft size={16} />
            Back to login
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

          <h1 className="mt-3 text-3xl font-bold">Register as a provider</h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Set up your organisation to list resources and manage sharing
            requests.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="provider-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Your full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="provider-name"
                  autoComplete="name"
                  required
                  disabled={loading || !!successMessage}
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Enter your name"
                  className={`${inputClass} pl-11 disabled:opacity-60`}
                />
              </div>
            </div>

            {/* 2. Organisation Type Dropdown */}
            <div>
              <label
                htmlFor="organisation-type"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Organisation type
              </label>

              <div className="relative">
                <Layers
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <select
                  id="organisation-type"
                  required
                  disabled={loading || !!successMessage}
                  value={form.organisationType}
                  onChange={(event) =>
                    updateField("organisationType", event.target.value)
                  }
                  className={`${inputClass} pl-11 pr-10 appearance-none cursor-pointer disabled:opacity-60 ${
                    !form.organisationType ? "text-slate-500" : "text-white"
                  }`}
                >
                  <option value="" disabled className="bg-[#101218] text-slate-500">
                    Select organisation type
                  </option>
                  {ORGANISATION_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-[#101218] text-white py-1"
                    >
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            {/* 3. Organisation Name (Dynamic Label & Placeholder) */}
            <div>
              <label
                htmlFor="organisation-name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                {currentOrgConfig.label}
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="organisation-name"
                  required
                  disabled={loading || !!successMessage}
                  value={form.organisationName}
                  onChange={(event) =>
                    updateField("organisationName", event.target.value)
                  }
                  placeholder={currentOrgConfig.placeholder}
                  className={`${inputClass} pl-11 disabled:opacity-60`}
                />
              </div>
            </div>

            {/* 4. Work Email */}
            <div>
              <label
                htmlFor="provider-register-email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Work email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="provider-register-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading || !!successMessage}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@company.com"
                  className={`${inputClass} pl-11 disabled:opacity-60`}
                />
              </div>
            </div>

            {/* 5. Password */}
            <div>
              <label
                htmlFor="provider-register-password"
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
                  id="provider-register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading || !!successMessage}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="At least 8 characters"
                  className={`${inputClass} pl-11 pr-12 disabled:opacity-60`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* 6. Confirm Password */}
            <div>
              <label
                htmlFor="provider-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>

              <input
                id="provider-confirm-password"
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
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-300"
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
                : "Create provider account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already registered?{" "}
            <Link
              to="/login/provider"
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
