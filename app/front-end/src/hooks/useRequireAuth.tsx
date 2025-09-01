import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null; // o spinner
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default RequireAuth;
