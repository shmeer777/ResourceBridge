import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BookingCreatePayload } from '../../types/booking';

interface BookingFormProps {
  resourceId: string;
  onSubmit: (payload: BookingCreatePayload) => Promise<void>;
  loading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ resourceId, onSubmit, loading }) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

    onSubmit({
      resource_id: resourceId,
      start_time: startDateTime,
      end_time: endDateTime,
      purpose,
    });
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400/60';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Start Window</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">End Window</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose *</label>
        <textarea
          rows={3}
          required
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Brief explanation of your intended usage..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Submitting...' : 'Request Slot'}
      </button>
    </form>
  );
};

export default BookingForm;
