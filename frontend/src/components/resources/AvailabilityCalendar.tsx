import React from 'react';
import { Clock } from 'lucide-react';
import { AvailabilitySlot } from '../../types/resource';

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ slots }) => {
  if (slots.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-xs text-slate-400 text-center">
        No specific slots published. Requests can be submitted for any open timeframe.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#08090D] text-xs"
        >
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-cyan-400" />
            <span>
              {new Date(slot.start_time).toLocaleString()} → {new Date(slot.end_time).toLocaleString()}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
            Open
          </span>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityCalendar;
