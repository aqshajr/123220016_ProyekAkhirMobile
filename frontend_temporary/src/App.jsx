import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navigation from './components/Navigation.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// ===== IMPORT HALAMAN PENGGUNA =====
import OnboardingPage from './pages/OnboardingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import TemplesPage from './pages/TemplesPage.jsx';
import TempleDetailPage from './pages/TempleDetailPage.jsx';
import ArtifactDetailPage from './pages/ArtifactDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MyTicketsPage from './pages/MyTicketsPage.jsx';
import BookmarkPage from './pages/BookmarkPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';

// ===== IMPORT HALAMAN ADMIN =====
import AdminTemplesPage from './pages/admin/AdminTemplesPage.jsx';
import CreateTemplePage from './pages/admin/CreateTemplePage.jsx';
import EditTemplePage from './pages/admin/EditTemplePage.jsx';
import AdminArtifactsPage from './pages/admin/AdminArtifactsPage.jsx';
import CreateArtifactPage from './pages/admin/CreateArtifactPage.jsx';
import EditArtifactPage from './pages/admin/EditArtifactPage.jsx';
import AdminTicketsPage from './pages/admin/AdminTicketsPage.jsx';
import CreateTicketPage from './pages/admin/CreateTicketPage.jsx';
import EditTicketPage from './pages/admin/EditTicketPage.jsx';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage.jsx';

// ===== KOMPONEN PLACEHOLDER =====
// Komponen untuk menampilkan halaman yang masih dalam pengembangan
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-secondary-light flex items-center justify-center pb-20">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-secondary mb-4">{title}</h1>
      <p className="text-gray">Halaman ini sedang dalam pengembangan</p>
    </div>
  </div>
);

// ===== KOMPONEN REDIRECT AUTENTIKASI =====
// Mengatur pengarahan pengguna berdasarkan status login
const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Memuat..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/onboarding" replace />;
};

// ===== KOMPONEN KONTEN UTAMA =====
// Menampilkan konten aplikasi setelah loading selesai
function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Memuat aplikasi..." />;
  }

  return (
    <div className="App">
      <Navigation />
      <Routes>
        {/* Route untuk halaman awal */}
        <Route path="/start" element={<AuthRedirect />} />
        
        {/* Route untuk onboarding dan auth */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route untuk user biasa */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-tickets" 
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-tickets/:id" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Detail Tiket" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets/:id" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Detail Tiket" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan" 
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/temples" 
          element={
            <ProtectedRoute>
              <TemplesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/temples/:id" 
          element={
            <ProtectedRoute>
              <TempleDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/artifacts" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Daftar Artefak" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/artifacts/:id" 
          element={
            <ProtectedRoute>
              <ArtifactDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Route untuk admin */}
        <Route 
          path="/admin/temples" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTemplesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/temples/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <CreateTemplePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/temples/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <EditTemplePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminArtifactsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <CreateArtifactPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/artifacts/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <EditArtifactPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTicketsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets/create" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <CreateTicketPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tickets/:id/edit" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <EditTicketPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/transactions" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTransactionsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/bookmarks" 
          element={
            <ProtectedRoute>
              <BookmarkPage />
            </ProtectedRoute>
          } 
        />

        {/* Route default - redirect ke start */}
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
