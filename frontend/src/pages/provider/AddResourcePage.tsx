import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Check, Loader2, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';

export const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: 'Equipment',
    description: '',
    location: '',
    image_url: '',
    capacity: 1,
    hourly_rate: 0,
    eligibility_criteria: '',
    rules: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Equipment',
    'Workspace',
    'Lab Facility',
    'Tools & Machinery',
    'High Performance Computing',
    'Vehicle & Transport',
    'Other'
  ];

  const updateField = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resourceService.createResource({
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location,
        image_url: form.image_url || undefined,
        capacity: Number(form.capacity) || 1,
        hourly_rate: Number(form.hourly_rate) || 0,
        eligibility_criteria: form.eligibility_criteria || undefined,
        rules: form.rules || undefined,
      });

      navigate('/provider/resources');
    } catch (err: any) {
      setError(err.message || 'Failed to create resource listing.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/provider/resources"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
      >
        <ArrowLeft size={16} />
        Back to Resources
      </Link>

      <div className="rounded-3xl border border-white/10 bg-[#101218] p-7 sm:p-9 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <Building2 size={24} />
        </div>

        <span className="eyebrow">Listing Creation</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Add Shared Resource</h1>
        <p className="text-sm text-slate-400 mt-1">
          Specify technical details, usage terms, and access eligibility for seekers.
        </p>

        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Resource Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Stratasys F370 3D Printer"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={`${inputClass} bg-[#08090D]`}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#101218]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe specifications, capabilities, and suitable projects..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Location *
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Building A, Room 204"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Capacity (persons)
              </label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.hourly_rate}
                onChange={(e) => updateField('hourly_rate', e.target.value)}
                placeholder="0 for free"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => updateField('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className={inputClass}
            />
          </div>

          <div className="pt-2 border-t border-white/5 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Eligibility & Prerequisite Rules (optional)
              </label>
              <input
                value={form.eligibility_criteria}
                onChange={(e) => updateField('eligibility_criteria', e.target.value)}
                placeholder="e.g. Certified lab technicians or university researchers with Level 2 induction"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Usage Guidelines & Safety Rules (optional)
              </label>
              <textarea
                rows={2}
                value={form.rules}
                onChange={(e) => updateField('rules', e.target.value)}
                placeholder="e.g. Safety goggles required at all times. Return clean after session."
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70 mt-6"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? 'Publishing listing...' : 'Publish Resource Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddResourcePage;
