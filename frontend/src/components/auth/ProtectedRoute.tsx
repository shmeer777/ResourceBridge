import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'provider' | 'seeker';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090D] text-cyan-400">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="text-sm font-medium">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectPath = allowedRole ? `/login/${allowedRole}` : '/role-selection';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const targetDashboard = user.role === 'provider' ? '/provider' : '/seeker';
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
