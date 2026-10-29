import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ResourceCreatePayload } from '../../types/resource';

interface ResourceFormProps {
  initialValues?: Partial<ResourceCreatePayload>;
  onSubmit: (data: ResourceCreatePayload) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Submit',
  loading,
}) => {
  const [form, setForm] = useState<ResourceCreatePayload>({
    title: initialValues?.title || '',
    category: initialValues?.category || 'Equipment',
    description: initialValues?.description || '',
    location: initialValues?.location || '',
    image_url: initialValues?.image_url || '',
    capacity: initialValues?.capacity || 1,
    hourly_rate: initialValues?.hourly_rate || 0,
    eligibility_criteria: initialValues?.eligibility_criteria || '',
    rules: initialValues?.rules || '',
  });

  const categories = [
    'Equipment',
    'Workspace',
    'Lab Facility',
    'Tools & Machinery',
    'High Performance Computing',
    'Vehicle & Transport',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`${inputClass} bg-[#08090D]`}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Description *</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Location *</label>
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Capacity</label>
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Hourly Rate ($)</label>
          <input
            type="number"
            min={0}
            step="any"
            value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Eligibility Criteria</label>
        <input
          value={form.eligibility_criteria}
          onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Usage Rules</label>
        <textarea
          rows={2}
          value={form.rules}
          onChange={(e) => setForm({ ...form, rules: e.target.value })}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-70 text-sm mt-4"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
};

export default ResourceForm;
