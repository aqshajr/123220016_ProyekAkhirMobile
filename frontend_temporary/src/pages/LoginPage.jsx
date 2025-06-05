import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect ke halaman yang dituju setelah login, atau ke home
  const from = location.state?.from?.pathname || '/';

  // Pulihkan kesalahan dari sessionStorage jika halaman disegarkan
  useEffect(() => {
    const savedError = sessionStorage.getItem('loginError');
    if (savedError) {
      setError(savedError);
      sessionStorage.removeItem('loginError'); // Hapus setelah ditampilkan
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error saat user mulai mengetik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cegah perilaku form default
    if (e.target) {
      e.target.preventDefault?.();
    }
    
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      // Cegah navigasi apa pun jika login gagal
      if (!result || !result.success) {
        const errorMessage = result?.error || 'Login gagal. Periksa email dan password Anda.';
        
        // Simpan juga di sessionStorage
        sessionStorage.setItem('loginError', errorMessage);
        
        setError(errorMessage);
        setIsLoading(false);
        return false; // Cegah pemrosesan lebih lanjut
      }
      
      if (result.success) {
        // Periksa apakah pengguna adalah admin dari data pengguna di localStorage setelah login
        const savedUser = localStorage.getItem('userData');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            
            // Periksa apakah admin (role 1 atau true)
            if (userData.role === 1 || userData.role === true) {
              navigate('/admin/temples');
              return;
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        
        // Pengalihan default untuk pengguna biasa
        navigate(from);
      }
    } catch (err) {
      console.error('LoginPage: Login error:', err);
      const errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      
      // Simpan juga di sessionStorage untuk persistensi
      sessionStorage.setItem('loginError', errorMessage);
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
    
    return false; // Cegah pengiriman form
  };

  if (isLoading) {
    return <LoadingSpinner text="Sedang masuk..." />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://storage.googleapis.com/artefacto-backend-service/assets/bg_loginregister.jpg"
          alt="Prambanan Temple Background"
          className="w-full h-full object-cover"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 mb-6 shadow-xl mx-auto w-full" style={{ 
          borderRadius: '24px', 
          maxWidth: '420px',
          border: '1px solid #e9ecef'
        }}>
          {/* Logo dan Title */}
          <div className="text-center mb-8">
            <div 
              className="mx-auto mb-4 flex items-center justify-center"
              style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#d4a464', 
                borderRadius: '16px' 
              }}
            >
              <img 
                src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                alt="Artefacto Logo"
                className="object-contain"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
            <h1 className="font-bold text-secondary mb-2" style={{ fontSize: '24px', fontWeight: 'bold' }}>ARTEFACTO</h1>
            <p className="text-gray" style={{ fontSize: '14px', marginBottom: '16px' }}>Jelajahi Warisan Budaya Indonesia</p>
          </div>

          {/* Error Message - Simple and Always Visible */}
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '0', fontWeight: '500' }}>
                ❌ {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            onReset={(e) => e.preventDefault()}
            autoComplete="off"
          >
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="font-medium text-secondary mb-2 block" style={{ fontSize: '16px', fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan email Anda"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                style={{ 
                  height: '44px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px'
                }}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="font-medium text-secondary mb-2 block" style={{ fontSize: '16px', fontWeight: 'bold' }}>Password</label>
              <div className="relative" style={{ height: '44px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password Anda"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  style={{ 
                    height: '44px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px'
                  }}
                  required
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 flex items-center justify-center w-12 text-primary hover:text-primary-yellow cursor-pointer transition-colors"
                  style={{ top: '0', height: '44px', marginRight: '10px' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '12px',
                marginTop: '24px'
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sedang Masuk...</span>
                </div>
              ) : (
                <span>Masuk</span>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center" style={{ marginTop: '20px' }}>
              <span className="text-gray" style={{ fontSize: '14px' }}>Belum punya akun? </span>
              <Link 
                to="/register" 
                className="text-primary font-medium hover:text-primary-yellow transition-colors"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                Daftar
              </Link>
            </div>
          </form>
        </div>

        {/* Location Info */}
        <div className="flex items-center justify-center text-white">
          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
          <span style={{ fontSize: '14px', opacity: '0.9' }}>Candi Prambanan, Indonesia</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 