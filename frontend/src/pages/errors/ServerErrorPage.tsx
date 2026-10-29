import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090D] text-white p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#101218] p-8 text-center space-y-4 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertOctagon size={28} />
        </div>
        <h1 className="text-2xl font-bold">500 — Server Error</h1>
        <p className="text-sm text-slate-400">
          Something went wrong while processing your request. Please try again later.
        </p>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center gap-2 text-xs py-2 px-5 mt-4"
        >
          <ArrowLeft size={15} />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ServerErrorPage;
