import React, { useState, useRef } from 'react';
import { User, Camera, Edit3, Trash2, Eye, EyeOff, Save, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // Form state untuk edit profil
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    profilePicture: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Buat preview gambar
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Buat FormData untuk multipart/form-data
      const formDataToSend = new FormData();
      let hasChanges = false;
      
      // Hanya kirim field yang berubah
      if (formData.username !== user.username && formData.username.trim()) {
        formDataToSend.append('username', formData.username.trim());
        hasChanges = true;
      }
      
      if (formData.email !== user.email && formData.email.trim()) {
        formDataToSend.append('email', formData.email.trim());
        hasChanges = true;
      }
      
      // Untuk password, hanya kirim jika ada currentPassword
      if (formData.currentPassword && formData.currentPassword.trim()) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        hasChanges = true;
        
        // Jika ada newPassword, kirim juga
        if (formData.newPassword && formData.newPassword.trim()) {
          formDataToSend.append('newPassword', formData.newPassword);
        }
      }
      
      // Profile picture
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
        hasChanges = true;
      }

      // Cek apakah ada perubahan
      if (!hasChanges) {
        setError('Tidak ada perubahan yang perlu disimpan.');
        return;
      }

      // Validasi client-side
      if (formData.newPassword && formData.newPassword.length < 6) {
        setError('Password baru minimal 6 karakter.');
        return;
      }

      // Password saat ini hanya wajib jika mengubah email atau password baru
      const requiresPassword = formData.email !== user.email || formData.newPassword;
      
      if (requiresPassword && !formData.currentPassword) {
        setError('Password saat ini diperlukan untuk mengubah email atau password.');
        return;
      }

      console.log('Updating profile...');
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', typeof value === 'object' ? 'File' : value);
      }
      
      const response = await authAPI.updateProfile(formDataToSend);
      console.log('Profile update response:', response);

      // Update user data di localStorage jika ada response user
      if (response && response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      } else if (response && response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        profilePicture: null
      }));
      setPreviewImage(null);
      
      // Refresh halaman untuk mendapatkan data terbaru
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Gagal memperbarui profil. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Deleting account...');
      await authAPI.deleteAccount();
      
      // Logout dan redirect ke halaman login
      logout();
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Gagal menghapus akun. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      profilePicture: null
    });
    setPreviewImage(null);
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return <LoadingSpinner text="Memproses..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Profil</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Kelola informasi akun Anda</p>
            </div>
            <div style={{ marginLeft: 'auto', marginRight: '100px' }}>
              <button
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin keluar?')) {
                    logout();
                  }
                }}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span className="font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 120px', marginLeft: '300px', marginRight: '300px' }}>
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 mb-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20" style={{ width: '250px', height: '250px' }}>
                  {user?.profilePicture ? (
                    <img 
                      src={`${user.profilePicture}?t=${Date.now()}`}
                      alt="Profile" 
                      className="w-full h-full object-cover object-center"
                      style={{ aspectRatio: '1/1', width: '250px' }}
                    />
                  ) : (
                    <User size={125} className="text-primary" />
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Edit3 size={18} />
                  <span className="font-bold">Edit Profil</span>
                </button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium text-gray" style={{ fontSize: '18px' }}>Username</label>
                  <p className="text-secondary font-medium mt-1" style={{ fontSize: '16px' }}>{user?.username}</p>
                </div>
                <div>
                  <label className="font-medium text-gray" style={{ fontSize: '18px' }}>Email</label>
                  <p className="text-secondary font-medium mt-1" style={{ fontSize: '16px' }}>{user?.email}</p>
                </div>
                {isAdmin() && (
                  <div>
                    <label className="font-medium text-gray" style={{ fontSize: '18px' }}>Role</label>
                    <p className="text-secondary font-medium mt-1" style={{ fontSize: '16px' }}>Administrator</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleEditProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20" style={{ width: '250px', height: '250px' }}>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover object-center"
                      style={{ aspectRatio: '1/1', width: '250px' }}
                    />
                  ) : user?.profilePicture ? (
                    <img 
                      src={`${user.profilePicture}?t=${Date.now()}`}
                      alt="Profile" 
                      className="w-full h-full object-cover object-center"
                      style={{ aspectRatio: '1/1', width: '250px' }}
                    />
                  ) : (
                    <User size={125} className="text-primary" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Camera size={18} />
                    <span className="font-bold">Ganti Foto</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Password Saat Ini</label>
                  <div className="relative" style={{ height: '44px' }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input pr-12"
                      style={{ height: '44px' }}
                      placeholder="Diperlukan untuk ubah email/password"
                    />
                    <div
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                      style={{ top: '0', height: '44px', marginRight: '10px' }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  <p className="text-xs text-gray mt-1">Hanya diperlukan jika mengubah email atau password</p>
                </div>
                <div>
                  <label className="form-label">Password Baru (Opsional)</label>
                  <div className="relative" style={{ height: '44px' }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="form-input pr-12"
                      style={{ height: '44px' }}
                      placeholder="Kosongkan jika tidak ingin ganti password"
                    />
                    <div
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                      style={{ top: '0', height: '44px', marginRight: '10px' }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  <p className="text-xs text-gray mt-1">Minimal 6 karakter jika ingin mengganti password</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span className="font-bold">Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <X size={18} />
                  <span className="font-bold">Batal</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone - Only for regular users */}
        {!isAdmin() && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-600" style={{ marginBottom: '5px' }}>Hapus Akun</h3>
            <p className="text-gray mb-4">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Trash2 size={18} />
                <span className="font-bold">Delete Account</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  <p className="font-medium" style={{ marginBottom: '5px' }}>Apakah Anda yakin ingin menghapus akun?</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    <span className="font-bold">Ya, Hapus Akun</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <X size={18} />
                    <span className="font-bold">Batal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 