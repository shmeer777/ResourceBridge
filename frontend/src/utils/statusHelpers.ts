export function getBookingStatusBadge(status: string): { label: string; className: string } {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    case 'pending':
      return {
        label: 'Pending Approval',
        className: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-500/10 text-red-400 border-red-500/30',
      };
    case 'checked_in':
      return {
        label: 'Checked In',
        className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
    default:
      return {
        label: status || 'Unknown',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
}

export function getConditionRatingBadge(rating: string): { label: string; className: string } {
  switch (rating?.toLowerCase()) {
    case 'excellent':
      return {
        label: 'Excellent',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    case 'good':
      return {
        label: 'Good',
        className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      };
    case 'fair':
      return {
        label: 'Fair',
        className: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    case 'damaged':
      return {
        label: 'Damaged / Needs Service',
        className: 'bg-red-500/10 text-red-400 border-red-500/30',
      };
    default:
      return {
        label: rating || 'Unrated',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
}
