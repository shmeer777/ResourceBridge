import React, { useState } from 'react';
import { User, Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

export const SeekerSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [orgName, setOrgName] = useState(user?.organization_name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await userService.updateProfile({
        full_name: fullName,
        organization_name: orgName,
        password: password || undefined,
      });
      await refreshUser();
      setSuccess(true);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/10">
        <span className="eyebrow">Account Settings</span>
        <h1 className="text-3xl font-bold tracking-tight">Seeker Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 sm:p-9 shadow-xl">
        {success && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3">
            <Check size={18} />
            Profile updated successfully.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
            <input disabled value={user?.email || ''} className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Affiliation / Organization</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 text-slate-950 font-bold py-3 text-sm hover:brightness-110 transition disabled:opacity-70 mt-6"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SeekerSettingsPage;
