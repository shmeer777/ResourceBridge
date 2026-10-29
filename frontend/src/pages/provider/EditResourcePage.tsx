import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Check, Loader2, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';

export const EditResourcePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: 'Equipment',
    description: '',
    location: '',
    image_url: '',
    capacity: 1,
    hourly_rate: 0,
    status: 'available',
    eligibility_criteria: '',
    rules: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
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

  useEffect(() => {
    async function loadResource() {
      if (!id) return;
      try {
        setInitialLoading(true);
        const data = await resourceService.getResourceById(id);
        setForm({
          title: data.title,
          category: data.category,
          description: data.description,
          location: data.location,
          image_url: data.image_url || '',
          capacity: data.capacity,
          hourly_rate: data.hourly_rate,
          status: data.status,
          eligibility_criteria: data.eligibility_criteria || '',
          rules: data.rules || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load resource');
      } finally {
        setInitialLoading(false);
      }
    }
    loadResource();
  }, [id]);

  const updateField = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setLoading(true);

    try {
      await resourceService.updateResource(id, {
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location,
        image_url: form.image_url || undefined,
        capacity: Number(form.capacity) || 1,
        hourly_rate: Number(form.hourly_rate) || 0,
        status: form.status,
        eligibility_criteria: form.eligibility_criteria || undefined,
        rules: form.rules || undefined,
      });

      navigate('/provider/resources');
    } catch (err: any) {
      setError(err.message || 'Failed to update resource listing.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60';

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

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

        <span className="eyebrow">Listing Maintenance</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Edit Resource Listing</h1>

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
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={`${inputClass} bg-[#08090D]`}
              >
                <option value="available" className="bg-[#101218]">Available</option>
                <option value="maintenance" className="bg-[#101218]">Under Maintenance</option>
                <option value="unavailable" className="bg-[#101218]">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              Eligibility Criteria
            </label>
            <input
              value={form.eligibility_criteria}
              onChange={(e) => updateField('eligibility_criteria', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              Usage Guidelines & Safety Rules
            </label>
            <textarea
              rows={2}
              value={form.rules}
              onChange={(e) => updateField('rules', e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70 mt-6"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditResourcePage;
