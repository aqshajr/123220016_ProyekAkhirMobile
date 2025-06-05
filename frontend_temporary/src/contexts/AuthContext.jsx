import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../utils/api';

// ===== CONTEXT CREATION =====
// Membuat context untuk menyimpan state autentikasi
const AuthContext = createContext();

// ===== CUSTOM HOOK =====
// Hook untuk mengakses context autentikasi dari komponen manapun
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

// ===== PROVIDER COMPONENT =====
// Komponen yang menyediakan state autentikasi ke seluruh aplikasi
export const AuthProvider = ({ children }) => {
  // State untuk status autentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State untuk role pengguna (0: user biasa, 1: admin)
  const [userRole, setUserRole] = useState('0');
  // State untuk status loading
  const [isLoading, setIsLoading] = useState(true);
  // State untuk data pengguna
  const [user, setUser] = useState(null);

  // ===== AUTHENTICATION CHECK =====
  // Cek status autentikasi saat aplikasi dimuat
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fungsi untuk memeriksa status autentikasi
  const checkAuthStatus = async () => {
    try {
      const authenticated = authAPI.isAuthenticated();
      const role = authAPI.getUserRole();
      
      console.log('Checking auth status:', { authenticated, role });
      
      setIsAuthenticated(authenticated);
      setUserRole(role);
      
      // Jika terautentikasi, ambil data pengguna dari localStorage
      if (authenticated) {
        const savedUser = localStorage.getItem('userData');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('Loaded user data from localStorage:', userData);
            
            // Pastikan role konsisten antara localStorage dan cookies
            if (userData.role !== undefined) {
              let userRole = userData.role;
              // Konversi role boolean ke integer jika diperlukan
              if (typeof userRole === 'boolean') {
                userRole = userRole ? 1 : 0;
                console.log('Converted boolean role from localStorage to integer:', userRole);
                userData.role = userRole;
              }
              
              const userRoleString = userRole.toString();
              setUserRole(userRoleString);
              // Update cookie jika berbeda
              if (role !== userRoleString) {
                Cookies.set('userRole', userRoleString, { expires: 7 });
              }
            }
            
            setUser(userData);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
            // Set data pengguna default jika parsing gagal
            setUser({
              username: 'User',
              email: 'user@example.com',
              role: parseInt(role) || 0
            });
          }
        } else {
          // Set data pengguna default jika tidak ada di localStorage
          setUser({
            username: 'User',
            email: 'user@example.com',
            role: parseInt(role) || 0
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PROFILE MANAGEMENT =====
  // Fungsi untuk memperbarui data profil pengguna dari API
  const refreshUserProfile = async () => {
    try {
      const token = Cookies.get('authToken');
      if (!token) {
        console.warn('No auth token found');
        return { success: false, error: 'No authentication token' };
      }

      console.log('Refreshing user profile...');
      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://artefacto-backend-749281711221.us-central1.run.app/api'}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Refreshed profile data:', profileData);

        if (profileData.data && profileData.data.user) {
          const userData = profileData.data.user;
          let userRole = userData.role !== undefined ? userData.role : 0;

          // Convert boolean role to integer (true = 1, false = 0)
          if (typeof userRole === 'boolean') {
            userRole = userRole ? 1 : 0;
            console.log('Converted boolean role to integer in refresh:', userRole);
          }

          console.log('Updated user role from profile:', userRole);

          // Update state
          setUser(userData);
          setUserRole(userRole.toString());

          // Update localStorage dan cookies
          localStorage.setItem('userData', JSON.stringify(userData));
          Cookies.set('userRole', userRole.toString(), { expires: 7 });

          return { success: true, data: userData };
        }
      } else {
        console.error('Failed to refresh profile:', profileResponse.status);
        return { success: false, error: 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return { success: false, error: error.message };
    }
  };

  // ===== AUTHENTICATION FUNCTIONS =====
  // Fungsi untuk melakukan login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      console.log('Login attempt:', { email, password });
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);
      
      // Validasi response structure - check both possible structures
      if (response && response.data && response.data.user) {
        // New structure: response.data.user
        const userData = response.data.user;
        const token = response.data.token;
        
        console.log('User data from login:', userData);
        console.log('Role from login response:', userData.role);
        
        // Selalu ambil profile untuk mendapatkan role yang akurat dari database
        let finalUserData = userData;
        let userRole = userData.role !== undefined ? userData.role : null;
        
        // Convert boolean role to integer (true = 1, false = 0)
        if (typeof userRole === 'boolean') {
          userRole = userRole ? 1 : 0;
          console.log('Converted boolean role to integer:', userRole);
        }
        
        console.log('Fetching user profile to get accurate role...');
        try {
          // Ambil profile untuk mendapatkan role yang akurat
          const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://artefacto-backend-749281711221.us-central1.run.app/api'}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Profile response:', profileData);
            
            if (profileData.data && profileData.data.user) {
              // Gunakan data dari profile yang lebih lengkap dan akurat
              finalUserData = {
                ...userData,
                ...profileData.data.user,
                id: profileData.data.user.userID || userData.id, // Pastikan id konsisten
              };
              
              if (profileData.data.user.role !== undefined) {
                let profileRole = profileData.data.user.role;
                // Convert boolean role to integer if needed
                if (typeof profileRole === 'boolean') {
                  profileRole = profileRole ? 1 : 0;
                  console.log('Converted profile boolean role to integer:', profileRole);
                }
                userRole = profileRole;
                console.log('Role from profile:', userRole);
              }
            }
          } else {
            console.warn('Failed to fetch profile, using login data');
          }
        } catch (profileError) {
          console.error('Error fetching profile for role:', profileError);
          console.warn('Using role from login response');
        }
        
        // Set default role jika masih null
        if (userRole === null) {
          userRole = 0; // Default to user role
        }
        
        console.log('Final user data:', finalUserData);
        console.log('Final user role:', userRole);
        
        setIsAuthenticated(true);
        setUserRole(userRole.toString());
        setUser(finalUserData);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(finalUserData));
        
        // Pastikan role tersimpan di cookies juga
        Cookies.set('userRole', userRole.toString(), { expires: 7 });
        
        return { success: true, data: response };
      } else if (response && response.user && response.user.role !== undefined) {
        // Old structure: response.user
        const userData = response.user;
        let userRole = userData.role !== undefined ? userData.role : 0;
        
        console.log('User data from login (old structure):', userData);
        console.log('User role from login (old structure):', userRole);
        
        setIsAuthenticated(true);
        setUserRole(userRole.toString());
        setUser(userData);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Pastikan role tersimpan di cookies juga
        Cookies.set('userRole', userRole.toString(), { expires: 7 });
        
        return { success: true, data: response };
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Reset auth state on error
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK_CHANGED') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.';
      } else if (error.message === 'Invalid response structure from server') {
        errorMessage = 'Server tidak merespons dengan benar. Silakan coba lagi nanti.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk melakukan registrasi
  const register = async (username, email, password, passwordConfirmation) => {
    try {
      setIsLoading(true);
      
      // Log data yang akan dikirim
      console.log('Register data:', { username, email, password, passwordConfirmation });
      
      const response = await authAPI.register(username, email, password, passwordConfirmation);
      
      console.log('Register response:', response);
      console.log('Response data:', response?.data);
      console.log('Response user:', response?.user);
      
      // Validasi response structure - server returns data.user, not user directly
      if (response && response.data && response.data.user) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Set default role to 0 (user) if not provided
        let userRole = userData.role !== undefined ? userData.role : 0;
        
        // Convert boolean role to integer (true = 1, false = 0)
        if (typeof userRole === 'boolean') {
          userRole = userRole ? 1 : 0;
          console.log('Converted boolean role to integer in register:', userRole);
        }
        
        setIsAuthenticated(true);
        setUserRole(userRole.toString());
        setUser(userData);
        
        // Simpan user data ke localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Save token if provided
        if (token) {
          // Token sudah disimpan di api.js, tapi pastikan role juga disimpan
          Cookies.set('userRole', userRole.toString(), { expires: 7 });
        }
        
        return { success: true, data: response };
      } else {
        console.log('Response structure validation failed');
        console.log('Expected: response.data.user, got:', response);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Log each validation error in detail
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err, index) => {
          console.error(`Validation error ${index + 1}:`, err);
        });
      }
      
      // Reset auth state on error
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Jika ada error validasi detail, tampilkan
        if (error.response.data.errors) {
          if (Array.isArray(error.response.data.errors)) {
            // Jika errors adalah array of objects
            const validationErrors = error.response.data.errors
              .map(err => {
                if (typeof err === 'object' && err.message) {
                  return err.message;
                } else if (typeof err === 'string') {
                  return err;
                } else {
                  return JSON.stringify(err);
                }
              })
              .join(', ');
            errorMessage += `: ${validationErrors}`;
          } else if (typeof error.response.data.errors === 'object') {
            // Jika errors adalah object dengan field names
            const validationErrors = Object.values(error.response.data.errors)
              .flat()
              .join(', ');
            errorMessage += `: ${validationErrors}`;
          }
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK_CHANGED') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba lagi nanti.';
      } else if (error.message === 'Invalid response structure from server') {
        errorMessage = 'Server tidak merespons dengan benar. Silakan coba lagi nanti.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk melakukan logout
  const logout = () => {
    try {
      authAPI.logout();
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      // Hapus user data dari localStorage
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fungsi untuk memperbarui profil
  const updateProfile = async (formData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(formData);
      
      // Update user data jika berhasil
      if (response.user) {
        setUser(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Update profil gagal. Silakan coba lagi.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menghapus akun
  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.deleteAccount();
      
      // Reset auth state setelah delete account
      setIsAuthenticated(false);
      setUserRole('0');
      setUser(null);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Delete account error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Hapus akun gagal. Silakan coba lagi.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ROLE CHECKING =====
  // Fungsi untuk mengecek apakah pengguna adalah admin
  const isAdmin = () => {
    return userRole === '1';
  };

  // Fungsi untuk mengecek apakah pengguna adalah user biasa
  const isUser = () => {
    return userRole === '0';
  };

  // Value yang akan disediakan oleh context
  const value = {
    // State
    isAuthenticated,
    userRole,
    isLoading,
    user,
    
    // Functions
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    checkAuthStatus,
    refreshUserProfile,
    
    // Helper functions
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;