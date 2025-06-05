import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Tampilkan loading saat masih memeriksa autentikasi
  if (isLoading) {
    return <LoadingSpinner text="Memuat..." />;
  }

  // Arahkan ke login dengan menyimpan halaman yang ingin diakses
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Arahkan ke home jika butuh admin tapi pengguna bukan admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Render children jika semua kondisi terpenuhi
  return children;
};

export default ProtectedRoute; 