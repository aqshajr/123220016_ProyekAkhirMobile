import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Restore error from sessionStorage if page was refreshed
  useEffect(() => {
    const savedError = sessionStorage.getItem('registerError');
    if (savedError) {
      setError(savedError);
      sessionStorage.removeItem('registerError'); // Clear after showing
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
    
    // Prevent any default form behavior
    if (e.target) {
      e.target.preventDefault?.();
    }
    
    setError('');

    // Validasi password confirmation
    if (formData.password !== formData.passwordConfirmation) {
      const errorMessage = 'Password dan konfirmasi password tidak cocok.';
      sessionStorage.setItem('registerError', errorMessage);
      setError(errorMessage);
      return false;
    }

    // Validasi password length
    if (formData.password.length < 8) {
      const errorMessage = 'Password harus minimal 8 karakter.';
      sessionStorage.setItem('registerError', errorMessage);
      setError(errorMessage);
      return false;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.passwordConfirmation
      );
      
      if (!result || !result.success) {
        const errorMessage = result?.error || 'Registrasi gagal. Silakan coba lagi.';
        sessionStorage.setItem('registerError', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
      
      if (result.success) {
        // Setelah register berhasil, redirect ke home (karena sudah auto login)
        navigate('/');
      }
    } catch (err) {
      console.error('RegisterPage: Register error:', err);
      const errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      sessionStorage.setItem('registerError', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  if (isLoading) {
    return <LoadingSpinner text="Sedang mendaftar..." />;
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
        {/* Register Form Card */}
        <div className="bg-white p-6 sm:p-8 mb-6 shadow-xl mx-auto w-full max-h-[90vh] overflow-y-auto" style={{ 
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
            <p className="text-gray" style={{ fontSize: '14px', marginBottom: '16px' }}>Bergabunglah dalam Petualangan Budaya</p>
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

          {/* Register Form */}
          <form 
            onSubmit={handleSubmit} 
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            onReset={(e) => e.preventDefault()}
            autoComplete="off"
          >
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="font-medium text-secondary mb-2 block" style={{ fontSize: '16px', fontWeight: 'bold' }}>Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Masukkan username Anda"
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
                  placeholder="Masukkan password (min 8 karakter)"
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

            {/* Password Confirmation Field */}
            <div>
              <label htmlFor="passwordConfirmation" className="font-medium text-secondary mb-2 block" style={{ fontSize: '16px', fontWeight: 'bold' }}>Konfirmasi Password</label>
              <div className="relative" style={{ height: '44px' }}>
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleInputChange}
                  placeholder="Konfirmasi password Anda"
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
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-0 flex items-center justify-center w-12 text-primary hover:text-primary-yellow cursor-pointer transition-colors"
                  style={{ top: '0', height: '44px', marginRight: '10px' }}
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '12px',
                marginTop: '8px'
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sedang Daftar...</span>
                </div>
              ) : (
                <span>Daftar</span>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center" style={{ marginTop: '16px' }}>
              <span className="text-gray" style={{ fontSize: '14px' }}>Sudah punya akun? </span>
              <Link 
                to="/login" 
                className="text-primary font-medium hover:text-primary-yellow transition-colors"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                Masuk
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

export default RegisterPage; 