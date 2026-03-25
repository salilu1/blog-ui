import { Routes, Route } from 'react-router-dom';
import Home from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PostDetail from '../features/posts/PostDetail';
import ProtectedRoute from './ProtectedRoute';

// Admin Components
import AdminLayout from '../features/admin/AdminLayout';
import AdminDashboard from '../features/admin/AdminDashboard';
import ManagePosts from '../features/admin/ManagePosts';

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
       * PUBLIC ROUTES
       * ========================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* =========================
       * PROTECTED USER ROUTES
       * ========================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/posts/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />

      {/* =========================
       * PROTECTED ADMIN ROUTES (NESTED)
       * ========================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* This renders when the user is exactly at /admin */}
        <Route index element={<AdminDashboard />} />
        
        {/* This renders at /admin/posts */}
        <Route path="posts" element={<ManagePosts />} />
      </Route>

      {/* =========================
       * 404 NOT FOUND
       * ========================= */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-4xl font-bold text-gray-800">404</h2>
            <p className="text-gray-500 mt-2">Oops! The page you're looking for doesn't exist.</p>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;