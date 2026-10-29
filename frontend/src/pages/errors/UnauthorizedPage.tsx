import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090D] text-white p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#101218] p-8 text-center space-y-4 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-2xl font-bold">403 — Access Restricted</h1>
        <p className="text-sm text-slate-400">
          You do not have permission to view this resource or perform this operation.
        </p>
        <Link
          to="/role-selection"
          className="btn btn-primary inline-flex items-center gap-2 text-xs py-2 px-5 mt-4"
        >
          <ArrowLeft size={15} />
          Switch Role / Sign In
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
