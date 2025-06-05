import Cookies from 'js-cookie';

export const debugAuth = () => {
  const authToken = Cookies.get('authToken');
  const userRole = Cookies.get('userRole');
  const userData = localStorage.getItem('userData');
  
  console.group('🐛 Auth Debug Info');
  console.log('Auth Token:', authToken ? '✅ Present' : '❌ Missing');
  console.log('User Role (Cookie):', userRole);
  console.log('User Data (localStorage):', userData);
  
  if (userData) {
    try {
      const parsedUserData = JSON.parse(userData);
      console.log('Parsed User Data:', parsedUserData);
      console.log('Role from User Data:', parsedUserData.role);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  console.groupEnd();
  
  return {
    authToken,
    userRole,
    userData,
    isAuthenticated: !!authToken,
    isAdmin: userRole === '1' || userRole === 1,
    isUser: userRole === '0' || userRole === 0
  };
};

export const clearAuth = () => {
  console.log('🧹 Clearing authentication data...');
  Cookies.remove('authToken');
  Cookies.remove('userRole');
  localStorage.removeItem('userData');
  console.log('✅ Authentication data cleared');
};

// Tambahkan ke window untuk debugging mudah di console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.clearAuth = clearAuth;
} 