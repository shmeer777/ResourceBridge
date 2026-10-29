import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ConditionReportCreatePayload } from '../../types/report';

interface ConditionReportFormProps {
  resourceId: string;
  bookingId?: string;
  reportType?: 'check_in' | 'check_out' | 'incident' | 'general';
  onSubmit: (payload: ConditionReportCreatePayload) => Promise<void>;
  loading?: boolean;
}

export const ConditionReportForm: React.FC<ConditionReportFormProps> = ({
  resourceId,
  bookingId,
  reportType = 'check_in',
  onSubmit,
  loading,
}) => {
  const [rating, setRating] = useState<'excellent' | 'good' | 'fair' | 'damaged'>('good');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      resource_id: resourceId,
      booking_id: bookingId,
      report_type: reportType,
      condition_rating: rating,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Condition Rating</label>
        <div className="grid grid-cols-4 gap-2">
          {(['excellent', 'good', 'fair', 'damaged'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className={`py-2 rounded-xl text-xs font-semibold capitalize border transition ${
                rating === r
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                  : 'border-white/10 bg-[#08090D] text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Inspection Notes</label>
        <textarea
          rows={3}
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe condition, clean status, or anomalies..."
          className="w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400/60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition disabled:opacity-70"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Submitting...' : 'Log Condition Report'}
      </button>
    </form>
  );
};

export default ConditionReportForm;
