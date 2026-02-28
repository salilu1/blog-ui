import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import type { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token) return <Navigate to="/login" replace />;

  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;