import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface IncidentReportFormProps {
  resourceId: string;
  bookingId?: string;
  onSubmit: (payload: { resource_id: string; booking_id?: string; severity: string; description: string }) => Promise<void>;
  loading?: boolean;
}

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  resourceId,
  bookingId,
  onSubmit,
  loading,
}) => {
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      resource_id: resourceId,
      booking_id: bookingId,
      severity,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
        <AlertTriangle size={18} />
        <span>Report an Issue or Malfunction</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
        >
          <option value="low">Low (minor wear / consumable low)</option>
          <option value="medium">Medium (needs servicing soon)</option>
          <option value="high">High (unsafe to operate)</option>
          <option value="critical">Critical (emergency / physical damage)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Description</label>
        <textarea
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the breakdown or incident..."
          className="w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition disabled:opacity-70"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Submitting...' : 'Submit Incident Report'}
      </button>
    </form>
  );
};

export default IncidentReportForm;
