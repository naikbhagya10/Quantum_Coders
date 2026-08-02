import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="surface-card p-8 rounded-3xl border border-base shadow-soft flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
