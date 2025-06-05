import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, FileText, Lightbulb, LogOut } from 'lucide-react';
import { templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const CreateTemplePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    funfactTitle: '',
    funfactDescription: '',
    locationUrl: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Nama candi harus diisi';
        } else if (value.trim().length < 3) {
          errors.title = 'Nama candi minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.title = 'Nama candi maksimal 100 karakter';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errors.description = 'Deskripsi candi harus diisi';
        } else if (value.trim().length < 10) {
          errors.description = 'Deskripsi minimal 10 karakter';
        } else if (value.trim().length > 1000) {
          errors.description = 'Deskripsi maksimal 1000 karakter';
        }
        break;
        
      case 'funfactTitle':
        if (!value.trim()) {
          errors.funfactTitle = 'Judul Fun Fact harus diisi';
        } else if (value.trim().length < 3) {
          errors.funfactTitle = 'Judul Fun Fact minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.funfactTitle = 'Judul Fun Fact maksimal 100 karakter';
        }
        break;
        
      case 'funfactDescription':
        if (!value.trim()) {
          errors.funfactDescription = 'Deskripsi Fun Fact harus diisi';
        } else if (value.trim().length < 10) {
          errors.funfactDescription = 'Deskripsi Fun Fact minimal 10 karakter';
        } else if (value.trim().length > 500) {
          errors.funfactDescription = 'Deskripsi Fun Fact maksimal 500 karakter';
        }
        break;
        
      case 'locationUrl':
        if (!value.trim()) {
          errors.locationUrl = 'URL Google Maps harus diisi';
        } else {
          const urlPattern = /^https?:\/\/.+/;
          if (!urlPattern.test(value.trim())) {
            errors.locationUrl = 'URL harus dimulai dengan http:// atau https://';
          }
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only validate if field has been validated before (to prevent showing errors immediately)
    if (validatedFields.has(name)) {
      const fieldError = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        ...fieldError,
        // Remove error if field is now valid
        ...(Object.keys(fieldError).length === 0 ? { [name]: undefined } : {})
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as validated on blur
    setValidatedFields(prev => new Set([...prev, name]));
    
    // Validate field
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      ...fieldError,
      // Remove error if field is now valid
      ...(Object.keys(fieldError).length === 0 ? { [name]: undefined } : {})
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate image file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({
          ...prev,
          image: 'Format file harus JPG atau PNG'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          image: 'Ukuran file maksimal 5MB'
        }));
        return;
      }
      
      // Clear image error if validation passes
      setFieldErrors(prev => ({
        ...prev,
        image: undefined
      }));
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as validated
    setValidatedFields(new Set(Object.keys(formData)));
    
    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      Object.assign(allErrors, fieldError);
    });
    
    // Validate image
    if (!selectedImage) {
      allErrors.image = 'Gambar candi harus diupload';
    }
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setFieldErrors({});

      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('funfactTitle', formData.funfactTitle.trim());
      submitData.append('funfactDescription', formData.funfactDescription.trim());
      submitData.append('locationUrl', formData.locationUrl.trim());
      
      if (selectedImage) {
        submitData.append('image', selectedImage, selectedImage.name);
      }

      // Debug: Log FormData contents
      console.log('=== FormData Debug ===');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          console.log(`File details:`, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified
          });
        } else {
          console.log(`${key}: "${value}"`);
        }
      }
      console.log('=== End FormData Debug ===');

      // Test: Verify file is in FormData
      const fileInFormData = submitData.get('image');
      console.log('File from FormData:', fileInFormData);
      console.log('Is File instance:', fileInFormData instanceof File);
      
      // Additional debug: Check if file is readable
      if (fileInFormData instanceof File) {
        console.log('File is readable, size:', fileInFormData.size);
        console.log('File type:', fileInFormData.type);
        console.log('File name:', fileInFormData.name);
        
        // Test reading file as ArrayBuffer to ensure it's not corrupted
        try {
          const arrayBuffer = await fileInFormData.arrayBuffer();
          console.log('File ArrayBuffer size:', arrayBuffer.byteLength);
        } catch (err) {
          console.error('Error reading file as ArrayBuffer:', err);
        }
      }

      // Make API call with proper headers for FormData
      console.log('Sending request to API...');
      console.log('Request headers will be set automatically by browser for FormData');
      const response = await templeAPI.createTemple(submitData);
      console.log('API Response:', response);
      
      if (response) {
        alert('Candi berhasil ditambahkan!');
        navigate('/admin/temples');
      }
    } catch (err) {
      console.error('Error creating temple:', err);
      
      let errorMessage = 'Gagal menambahkan candi. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Show validation error details if available
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors.map(error => {
            if (typeof error === 'object' && error.message) {
              return error.message;
            }
            return error.toString();
          }).join(', ');
          errorMessage += `: ${validationErrors}`;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/temples');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Menambahkan candi..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Single Header */}
      <div className="bg-white shadow-sm">
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', width: '100%' }}>
            {/* Left: Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '20px' }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                backgroundColor: '#d4a464', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '32px',
                marginLeft: '16px'
              }}>
                <img 
                  src="https://storage.googleapis.com/artefacto-backend-service/assets/logo_artefacto.jpg"
                  alt="Artefacto Logo"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: 'bold', 
                color: '#243e3e',
                margin: '0',
                whiteSpace: 'nowrap'
              }}>
                Artefacto Admin Panel
              </h1>
            </div>
            
            {/* Center: Welcome Text */}
            <div style={{ 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#243e3e',
                lineHeight: '1.3',
                margin: 0
              }}>
                Selamat datang, admin!
              </h2>
              <p style={{ 
                fontSize: '15px', 
                color: '#6c6c6c',
                lineHeight: '1.2',
                margin: '4px 0 0 0'
              }}>
                Tambah candi baru ke sistem
              </p>
            </div>
            
            {/* Right: Logout Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '20px' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut size={18} />
                <span className="font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-t border-gray-100">
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ marginLeft: '10px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Tambah Candi Baru</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px', marginLeft: '10px' }}>Lengkapi informasi candi yang akan ditambahkan</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px', marginLeft: '80px', marginRight: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs">!</span>
                  </div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Left Column - Basic Information + Fun Fact */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f5f1ec', borderColor: '#c2a57e' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Informasi Dasar</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Detail utama tentang candi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5" style={{ marginTop: '20px' }}>
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Nama Candi *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Contoh: Candi Borobudur"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter, maksimal 100 karakter</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Deskripsi Candi *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        style={{ height: '188px' }}
                        placeholder="Jelaskan sejarah, arsitektur, dan keunikan candi..."
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-500 text-xs">Minimal 10 karakter, maksimal 1000 karakter</p>
                        <span className={`text-xs ${formData.description.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formData.description.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fun Fact Section */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f8f9f8', borderColor: '#b2b5aa' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Lightbulb size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Fun Fact</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Fakta menarik tentang candi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5" style={{ marginTop: '20px' }}>
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Judul Fun Fact *
                      </label>
                      <input
                        type="text"
                        name="funfactTitle"
                        value={formData.funfactTitle}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Contoh: Rahasia Relief Tersembunyi"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter, maksimal 100 karakter</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Deskripsi Fun Fact *
                      </label>
                      <textarea
                        name="funfactDescription"
                        value={formData.funfactDescription}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        style={{ height: '188px' }}
                        placeholder="Ceritakan fakta menarik tentang candi ini..."
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-500 text-xs">Minimal 10 karakter, maksimal 500 karakter</p>
                        <span className={`text-xs ${formData.funfactDescription.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formData.funfactDescription.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload + Location */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f2f4f5', borderColor: '#868a8f', height: '488px' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Gambar Candi</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Upload foto terbaik candi</p>
                    </div>
                    
                    {/* Action buttons - only show when image is uploaded */}
                    {previewImage && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Gambar berhasil diupload</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setPreviewImage(null);
                            setFieldErrors(prev => ({ ...prev, image: undefined }));
                          }}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-none hover:bg-red-100 transition-colors text-xs font-medium border border-red-200"
                        >
                          Hapus
                        </button>
                        <label className="px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors cursor-pointer text-xs font-medium border border-primary/20">
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    {/* Fixed height container for consistent size */}
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-inner w-full" style={{ maxWidth: '445px', height: '368px', flexShrink: 0 }}>
                        {previewImage ? (
                          <>
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                              <Upload size={24} className="text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-secondary mb-1">Upload Gambar Candi</span>
                            <span className="text-xs text-gray-500">JPG, PNG, maksimal 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              required
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f7f5f0', borderColor: '#8f754e', height: '417px' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Lokasi</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Link Google Maps untuk navigasi</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      URL Google Maps *
                    </label>
                    <input
                      type="url"
                      name="locationUrl"
                      value={formData.locationUrl}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="https://maps.app.goo.gl/..."
                      required
                    />
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">💡</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          <strong>Tips:</strong> Buka Google Maps, cari lokasi candi, klik "Bagikan" lalu salin link yang dihasilkan.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button below location card in right column */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex items-center justify-center space-x-2 w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-bold">Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Simpan Candi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplePage; 