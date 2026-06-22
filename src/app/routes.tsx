import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
};
