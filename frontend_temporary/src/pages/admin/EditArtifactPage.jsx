import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Package, FileText, MapPin, Lightbulb, LogOut } from 'lucide-react';
import { artifactAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const EditArtifactPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templeID: '',
    detailPeriod: '',
    detailMaterial: '',
    detailSize: '',
    detailStyle: '',
    funfactTitle: '',
    funfactDescription: '',
    locationUrl: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  const [templeData, setTempleData] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch artifact data
      const artifactResponse = await artifactAPI.getArtifactById(id);
      
      // Set artifact data
      if (artifactResponse && artifactResponse.data && artifactResponse.data.artifact) {
        const artifact = artifactResponse.data.artifact;
        setFormData({
          title: artifact.title || '',
          description: artifact.description || '',
          templeID: artifact.templeID || '', // Keep for form data but won't be editable
          detailPeriod: artifact.detailPeriod || '',
          detailMaterial: artifact.detailMaterial || '',
          detailSize: artifact.detailSize || '',
          detailStyle: artifact.detailStyle || '',
          funfactTitle: artifact.funfactTitle || '',
          funfactDescription: artifact.funfactDescription || '',
          locationUrl: artifact.locationUrl || '',
        });
        
        // Add cache busting parameter to force image refresh
        if (artifact.imageUrl) {
          const cacheBuster = `?v=${Date.now()}`;
          setCurrentImageUrl(artifact.imageUrl + cacheBuster);
        }

        // Fetch temple data if templeID exists
        if (artifact.templeID) {
          try {
            const { templeAPI } = await import('../../utils/api');
            const templeResponse = await templeAPI.getTempleById(artifact.templeID);
            if (templeResponse && templeResponse.data && templeResponse.data.temple) {
              setTempleData(templeResponse.data.temple);
            }
          } catch (templeError) {
            console.error('Error fetching temple data:', templeError);
            // Don't set error for temple fetch failure, just log it
          }
        }
      } else {
        setError('Data artefak tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data artefak. Silakan coba lagi.');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Validation rules
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Nama artefak harus diisi';
        } else if (value.trim().length < 3) {
          errors.title = 'Nama artefak minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.title = 'Nama artefak maksimal 100 karakter';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errors.description = 'Deskripsi artefak harus diisi';
        } else if (value.trim().length < 10) {
          errors.description = 'Deskripsi minimal 10 karakter';
        } else if (value.trim().length > 1000) {
          errors.description = 'Deskripsi maksimal 1000 karakter';
        }
        break;
        
      case 'detailPeriod':
        if (!value.trim()) {
          errors.detailPeriod = 'Detail periode harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailPeriod = 'Detail periode minimal 3 karakter';
        }
        break;
        
      case 'detailMaterial':
        if (!value.trim()) {
          errors.detailMaterial = 'Detail material harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailMaterial = 'Detail material minimal 3 karakter';
        }
        break;
        
      case 'detailSize':
        if (!value.trim()) {
          errors.detailSize = 'Detail ukuran harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailSize = 'Detail ukuran minimal 3 karakter';
        }
        break;
        
      case 'detailStyle':
        if (!value.trim()) {
          errors.detailStyle = 'Detail gaya harus diisi';
        } else if (value.trim().length < 3) {
          errors.detailStyle = 'Detail gaya minimal 3 karakter';
        }
        break;
        
      case 'funfactTitle':
        if (!value.trim()) {
          errors.funfactTitle = 'Judul fun fact harus diisi';
        } else if (value.trim().length < 3) {
          errors.funfactTitle = 'Judul fun fact minimal 3 karakter';
        } else if (value.trim().length > 100) {
          errors.funfactTitle = 'Judul fun fact maksimal 100 karakter';
        }
        break;
        
      case 'funfactDescription':
        if (!value.trim()) {
          errors.funfactDescription = 'Deskripsi fun fact harus diisi';
        } else if (value.trim().length < 10) {
          errors.funfactDescription = 'Deskripsi fun fact minimal 10 karakter';
        } else if (value.trim().length > 1000) {
          errors.funfactDescription = 'Deskripsi fun fact maksimal 1000 karakter';
        }
        break;
        
      case 'locationUrl':
        if (!value.trim()) {
          errors.locationUrl = 'URL lokasi harus diisi';
        } else if (value.trim().length > 500) {
          errors.locationUrl = 'URL lokasi maksimal 500 karakter';
        } else {
          try {
            new URL(value);
          } catch {
            errors.locationUrl = 'Format URL tidak valid';
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
    
    // Only validate if field has been validated before
    if (validatedFields.has(name)) {
      const fieldError = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        ...fieldError,
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
      submitData.append('templeID', formData.templeID);
      submitData.append('detailPeriod', formData.detailPeriod.trim());
      submitData.append('detailMaterial', formData.detailMaterial.trim());
      submitData.append('detailSize', formData.detailSize.trim());
      submitData.append('detailStyle', formData.detailStyle.trim());
      submitData.append('funfactTitle', formData.funfactTitle.trim());
      submitData.append('funfactDescription', formData.funfactDescription.trim());
      submitData.append('locationUrl', formData.locationUrl.trim());
      
      if (selectedImage) {
        submitData.append('image', selectedImage, selectedImage.name);
      }

      const response = await artifactAPI.updateArtifact(id, submitData);
      
      if (response) {
        alert('Artefak berhasil diperbarui!');
        navigate(`/artifacts/${id}`, { replace: true });
      }
    } catch (err) {
      console.error('Error updating artifact:', err);
      
      let errorMessage = 'Gagal memperbarui artefak. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
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
    navigate('/admin/artifacts');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  const removeCurrentImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setCurrentImageUrl('');
  };

  if (isDataLoading) {
    return <LoadingSpinner text="Memuat data artefak..." />;
  }

  if (error && !formData.title) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Memperbarui artefak..." />;
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
                Edit data artefak
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
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Edit Artefak</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px', marginLeft: '10px' }}>Perbarui informasi artefak yang dipilih</p>
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
              
              {/* Left Column - Basic Information + Image Upload */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f5f1ec', borderColor: '#c2a57e' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Informasi Dasar</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Detail utama tentang artefak</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5" style={{ marginTop: '20px' }}>
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Nama Artefak *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Contoh: Arca Ganesha"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Minimal 3 karakter, maksimal 100 karakter</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Deskripsi Artefak *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        style={{ height: '120px' }}
                        placeholder="Jelaskan sejarah, makna, dan keunikan artefak..."
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-500 text-xs">Minimal 10 karakter, maksimal 1000 karakter</p>
                        <span className={`text-xs ${formData.description.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formData.description.length}/1000
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Candi Asal
                      </label>
                      <input
                        type="text"
                        value={templeData ? templeData.title : 'Memuat data candi...'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                        placeholder="Candi tidak dapat diubah saat mengedit"
                      />
                      <p className="text-gray-500 text-xs mt-1">Candi asal artefak</p>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f2f4f5', borderColor: '#868a8f', height: '365px' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Gambar Artefak</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Upload foto terbaik artefak</p>
                    </div>
                    
                    {/* Action buttons - only show when image is uploaded */}
                    {(previewImage || currentImageUrl) && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Gambar tersedia</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCurrentImage}
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
                      <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-inner w-full" style={{ maxWidth: '445px', height: '257px', flexShrink: 0 }}>
                        {previewImage || currentImageUrl ? (
                          <>
                            <img 
                              src={previewImage || currentImageUrl} 
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
                            <span className="text-sm font-semibold text-secondary mb-1">Upload Gambar Artefak</span>
                            <span className="text-xs text-gray-500">JPG, PNG, maksimal 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Fun Fact + Location + Detail Artefak */}
              <div className="space-y-6">
                {/* Fun Fact Section */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f0f8fc', borderColor: '#4c9ebe' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Lightbulb size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Fun Fact</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Fakta menarik tentang artefak</p>
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
                        placeholder="Contoh: Simbolisme Tersembunyi"
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
                        style={{ height: '95px' }}
                        placeholder="Ceritakan fakta menarik tentang artefak ini..."
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-500 text-xs">Minimal 10 karakter, maksimal 1000 karakter</p>
                        <span className={`text-xs ${formData.funfactDescription.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formData.funfactDescription.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f7f5f0', borderColor: '#8f754e', height: '215px' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Lokasi</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Link museum atau tempat penyimpanan</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      URL Lokasi *
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
                          <strong>Tips:</strong> Masukkan link ke museum atau tempat penyimpanan artefak.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Artefak */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f8f9f8', borderColor: '#b2b5aa' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Detail Artefak</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Informasi teknis dan fisik</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5" style={{ marginTop: '20px' }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Periode *
                        </label>
                        <input
                          type="text"
                          name="detailPeriod"
                          value={formData.detailPeriod}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Contoh: Abad ke-8"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Material *
                        </label>
                        <input
                          type="text"
                          name="detailMaterial"
                          value={formData.detailMaterial}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Contoh: Batu Andesit"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Ukuran *
                        </label>
                        <input
                          type="text"
                          name="detailSize"
                          value={formData.detailSize}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Contoh: 50x30x25 cm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Gaya *
                        </label>
                        <input
                          type="text"
                          name="detailStyle"
                          value={formData.detailStyle}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          placeholder="Contoh: Jawa Tengah Klasik"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button centered below both columns */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center justify-center space-x-2"
                style={{ minWidth: '200px' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold">Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">Perbarui Artefak</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArtifactPage; 