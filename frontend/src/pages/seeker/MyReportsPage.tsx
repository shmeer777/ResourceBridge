import React, { useEffect, useState } from 'react';
import { ClipboardCheck, FileText, AlertCircle } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { ConditionReport } from '../../types/report';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ConditionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await reportService.getConditionReports();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'good':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'fair':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'damaged':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

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
        <span className="eyebrow">Inspections & Audits</span>
        <h1 className="text-3xl font-bold tracking-tight">My Usage & Condition Reports</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review check-in and check-out logs and condition ratings recorded for your sessions.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#101218]/50 p-12 text-center text-slate-400 space-y-2">
          <ClipboardCheck size={36} className="mx-auto text-slate-600" />
          <p>No condition reports logged yet. Reports appear once you check in or out of a resource.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRatingBadge(
                      r.condition_rating
                    )}`}
                  >
                    Rating: {r.condition_rating}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 capitalize">
                    {r.report_type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>

              <div className="text-sm text-slate-200">
                <p className="leading-relaxed">{r.notes}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Reporter: You</span>
                <span className="font-mono text-slate-500">ID: {r.id.substring(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
