import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { Resource, AvailabilitySlot } from '../../types/resource';

export const AvailabilityPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  // New slot inputs
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const [addingSlot, setAddingSlot] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await resourceService.getMyResources();
        setResources(data);
        if (data.length > 0) {
          setSelectedResourceId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedResourceId) return;
      try {
        const slotData = await resourceService.getAvailability(selectedResourceId);
        setSlots(slotData);
      } catch (err: any) {
        console.error(err);
      }
    }
    loadSlots();
  }, [selectedResourceId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;
    setError('');
    setAddingSlot(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

      const newSlot = await resourceService.addAvailability(selectedResourceId, {
        start_time: startDateTime,
        end_time: endDateTime,
        is_available: true,
      });

      setSlots((prev) => [...prev, newSlot]);
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to add availability window.');
    } finally {
      setAddingSlot(false);
    }
  };

  const inputClass =
    'rounded-xl border border-white/10 bg-[#08090D] px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400/60';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/10">
        <span className="eyebrow">Capacity Management</span>
        <h1 className="text-3xl font-bold tracking-tight">Resource Availability Windows</h1>
        <p className="text-sm text-slate-400 mt-1">
          Define bookable schedule windows for your shared facilities and tools.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-8 text-center text-slate-400">
          Please add a resource first before defining availability windows.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Select Resource
            </label>
            <div className="space-y-2">
              {resources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResourceId(r.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedResourceId === r.id
                      ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                      : 'border-white/10 bg-[#101218] text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.category} • {r.location}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#101218] p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                Add Open Window
              </h3>

              {error && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <form onSubmit={handleAddSlot} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Start Date & Time</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`flex-1 ${inputClass}`}
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
                    <label className="block text-[11px] text-slate-400 mb-1">End Date & Time</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`flex-1 ${inputClass}`}
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
                </div>

                <button
                  type="submit"
                  disabled={addingSlot}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:brightness-110 transition"
                >
                  {addingSlot ? 'Adding...' : 'Add Slot'}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Current Availability Slots</h3>
              {slots.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No specific availability slots created. This resource is open based on general request approval.
                </p>
              ) : (
                <div className="grid gap-2">
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-white/5 bg-[#101218] flex items-center justify-between text-xs"
                    >
                      <div className="font-mono text-cyan-300">
                        {new Date(s.start_time).toLocaleString()} → {new Date(s.end_time).toLocaleString()}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPage;
