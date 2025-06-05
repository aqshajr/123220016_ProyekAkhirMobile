import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Ticket, Camera, Bookmark, MapPin, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // Jangan tampilkan navigasi di halaman auth dan admin
  const hideNavigation = [
    '/login', 
    '/register', 
    '/onboarding',
    '/admin/temples',
    '/admin/temples/create',
    '/admin/artifacts',
    '/admin/artifacts/create', 
    '/admin/tickets',
    '/admin/tickets/create',
    '/admin/transactions'
  ].includes(location.pathname) || location.pathname.includes('/admin/temples/') || location.pathname.includes('/admin/artifacts/') || location.pathname.includes('/admin/tickets/');
  
  if (hideNavigation || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/my-tickets', icon: Ticket, label: 'Tiket' },
    { path: '/scan', icon: Camera, label: 'Scan' },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmark' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  const adminNavItems = [
    { path: '/admin/temples', icon: MapPin, label: 'Candi' },
    { path: '/admin/artifacts', icon: Camera, label: 'Artefak' },
    { path: '/admin/tickets', icon: Ticket, label: 'Tiket' },
    { path: '/admin/transactions', icon: Settings, label: 'Transaksi' }
  ];

  const navItems = isAdmin() ? adminNavItems : userNavItems;

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="container py-2">
          <div className="relative flex items-center justify-center w-full">
            <Link to="/" className="flex flex-col items-center justify-center space-y-1 no-underline" style={{ textDecoration: 'none' }}>
              <img 
                src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                alt="Artefacto Logo"
                style={{ width: '120px', height: '120px', objectFit: 'contain', marginTop: '16px', marginBottom: '12px' }}
              />
              <div className="text-center">
                <h1 className="font-bold text-secondary" style={{ fontSize: '32px', marginBottom: '5px', marginTop: '10px' }}>ARTEFACTO</h1>
                <p className="text-gray leading-none" style={{ fontSize: '24px' }}>
                  {isAdmin() ? 'Admin Panel' : 'Culture Explorer'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-inset-bottom" style={{ height: '70px' }}>
        <div className={`grid ${navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} h-full`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-0.5 transition-colors no-underline ${
                  isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-gray hover:text-primary'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation; 