import React, { useState } from 'react';
import { User, Mail, Lock, Building2, Eye, EyeOff, Loader2, ChevronDown, Layers } from 'lucide-react';
import { RegisterPayload } from '../../types/auth';
import { ORGANISATION_TYPES, ORGANISATION_FIELD_CONFIG } from '../../pages/auth/ProviderRegisterPage';

interface RegisterFormProps {
  role: 'provider' | 'seeker';
  onSubmit: (payload: RegisterPayload) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onSubmit, error, loading }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const currentOrgConfig = orgType
    ? ORGANISATION_FIELD_CONFIG[orgType] || {
        label: 'Organisation name',
        placeholder: 'Your company or institution',
      }
    : {
        label: 'Organisation name',
        placeholder: 'Your company or institution',
      };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (role === 'provider' && !orgType) {
      setValidationError('Please select an organisation type.');
      return;
    }

    if (role === 'provider' && !orgName.trim()) {
      setValidationError(`Please enter your ${currentOrgConfig.label.toLowerCase()}.`);
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    onSubmit({
      email,
      password,
      full_name: fullName.trim(),
      role,
      organization_name: orgName.trim() || undefined,
      organization_type: role === 'provider' ? orgType : undefined,
    });
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 placeholder:text-slate-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Full name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full name</label>
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* 2. Organisation type (required for provider) */}
      {role === 'provider' && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Organisation type</label>
          <div className="relative">
            <Layers size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              required
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className={`${inputClass} pl-10 pr-9 appearance-none cursor-pointer ${
                !orgType ? 'text-slate-500' : 'text-white'
              }`}
            >
              <option value="" disabled className="bg-[#101218] text-slate-500">
                Select organisation type
              </option>
              {ORGANISATION_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#101218] text-white py-1">
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
      )}

      {/* 3. Organisation name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {role === 'provider' ? currentOrgConfig.label : 'Affiliation (optional)'}
        </label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            required={role === 'provider'}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder={role === 'provider' ? currentOrgConfig.placeholder : 'University, company, or independent'}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* 4. Work email */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {role === 'provider' ? 'Work email' : 'Email address'}
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'provider' ? 'you@company.com' : 'you@domain.com'}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* 5. Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={`${inputClass} pl-10 pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* 6. Confirm password */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {(validationError || error) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
          {validationError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Creating account...' : `Create ${role} account`}
      </button>
    </form>
  );
};
