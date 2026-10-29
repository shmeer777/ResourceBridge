import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign } from 'lucide-react';
import { Resource } from '../../types/resource';

interface ResourceCardProps {
  resource: Resource;
  actionUrl?: string;
  actionLabel?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  actionUrl,
  actionLabel = 'View Details',
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101218] p-5 space-y-4 flex flex-col justify-between hover:border-cyan-400/40 transition shadow-lg group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
            {resource.category}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono capitalize">
            {resource.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
          {resource.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {resource.description}
        </p>

        <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-cyan-400 shrink-0" />
            <span className="truncate">{resource.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-cyan-400 shrink-0" />
            <span>Capacity: {resource.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-cyan-400 shrink-0" />
            <span>{resource.hourly_rate > 0 ? `$${resource.hourly_rate} / hour` : 'Free to share'}</span>
          </div>
        </div>

        {resource.eligibility_criteria && (
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-200">
            <span className="font-semibold text-cyan-400">Eligibility: </span>
            {resource.eligibility_criteria}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          {resource.organization_name || resource.owner_name || 'Verified Provider'}
        </span>
        {actionUrl && (
          <Link
            to={actionUrl}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold hover:brightness-110 transition shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
