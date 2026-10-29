import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  role: 'provider' | 'seeker';
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role, onSubmit, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email address</label>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090D] px-4 focus-within:border-cyan-400/60">
          <Mail size={16} className="text-slate-500 shrink-0" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#08090D] px-4 focus-within:border-cyan-400/60">
          <Lock size={16} className="text-slate-500 shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-500 hover:text-white"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-70 text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Authenticating...' : `Sign in as ${role}`}
      </button>
    </form>
  );
};

export default LoginForm;
