import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, FileText, MapPin, DollarSign, LogOut, ChevronDown } from 'lucide-react';
import { ticketAPI, templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const CreateTicketPage = () => {
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    templeID: '',
  });
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [templesLoading, setTemplesLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchTemples = async () => {
    try {
      setTemplesLoading(true);
      const response = await templeAPI.getAllTemples();
      
      if (response && response.data && response.data.temples) {
        setTemples(response.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching temples:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setTemplesLoading(false);
    }
  };

  // Validation rules
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'description':
        if (!value.trim()) {
          errors.description = 'Deskripsi tiket harus diisi';
        } else if (value.trim().length < 10) {
          errors.description = 'Deskripsi minimal 10 karakter';
        } else if (value.trim().length > 500) {
          errors.description = 'Deskripsi maksimal 500 karakter';
        }
        break;
        
      case 'price':
        if (!value.trim()) {
          errors.price = 'Harga tiket harus diisi';
        } else {
          const priceNum = parseFloat(value);
          if (isNaN(priceNum) || priceNum < 0) {
            errors.price = 'Harga harus berupa angka positif';
          } else if (priceNum > 10000000) {
            errors.price = 'Harga maksimal Rp 10.000.000';
          }
        }
        break;
        
      case 'templeID':
        if (!value) {
          errors.templeID = 'Candi harus dipilih';
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

  const handleTempleSelect = (templeID) => {
    setFormData(prev => ({
      ...prev,
      templeID: templeID
    }));
    setIsDropdownOpen(false);
    
    // Validate temple selection
    if (validatedFields.has('templeID')) {
      const fieldError = validateField('templeID', templeID);
      setFieldErrors(prev => ({
        ...prev,
        ...fieldError,
        ...(Object.keys(fieldError).length === 0 ? { templeID: undefined } : {})
      }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
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

      // Prepare data for submission
      const submitData = {
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        templeID: parseInt(formData.templeID),
      };

      const response = await ticketAPI.createTicket(submitData);
      
      if (response) {
        alert('Tiket berhasil ditambahkan!');
        navigate('/admin/tickets');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      
      let errorMessage = 'Gagal menambahkan tiket. Silakan coba lagi.';
      
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
    navigate('/admin/tickets');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (templesLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (isLoading) {
    return <LoadingSpinner text="Menambahkan tiket..." />;
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
                Tambah tiket baru ke sistem
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
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Tambah Tiket Baru</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px', marginLeft: '10px' }}>Buat tiket masuk untuk candi yang dipilih</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px', marginLeft: '100px', marginRight: '100px', marginTop: '80px' }}>
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
              
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f5f1ec', borderColor: '#c2a57e' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Informasi Tiket</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Detail tiket masuk candi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5" style={{ marginTop: '20px' }}>
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Candi Tujuan *
                      </label>
                      {templesLoading ? (
                        <div className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg">
                          Memuat data candi...
                        </div>
                      ) : (
                        <div className="relative">
                          <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-gray-700">
                              {formData.templeID ? temples.find(t => t.templeID === parseInt(formData.templeID))?.title : 'Pilih candi...'}
                            </span>
                            <ChevronDown 
                              size={18} 
                              className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </div>
                          
                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                              <div
                                onClick={() => handleTempleSelect('')}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700"
                              >
                                Pilih candi...
                              </div>
                              {temples.map((temple) => (
                                <div
                                  key={temple.templeID}
                                  onClick={() => handleTempleSelect(temple.templeID.toString())}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700"
                                >
                                  {temple.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-500 text-xs mt-1">Pilih candi untuk tiket masuk</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Deskripsi Tiket *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        style={{ height: '45px' }}
                        placeholder="Jelaskan detail tiket masuk..."
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-gray-500 text-xs">Minimal 10 karakter, maksimal 500 karakter</p>
                        <span className={`text-xs ${formData.description.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formData.description.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Pricing */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#f2f4f5', borderColor: '#868a8f', height: '283px' }}>
                  <div className="flex items-center space-x-3" style={{ marginLeft: '10px', marginBottom: '0px' }}>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', marginLeft: '10px' }}>Harga Tiket</h2>
                      <p className="text-sm text-gray-500" style={{ marginBottom: '0px', marginLeft: '10px' }}>Tentukan harga tiket masuk</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      Harga (Rupiah) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium" style={{ marginTop: '8px', marginLeft: '15px' }}>
                        Rp
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-full pr-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        style={{ paddingLeft: '40px' }}
                        placeholder="25000"
                        min="0"
                        max="10000000"
                        required
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Harga dalam Rupiah (maksimal Rp 10.000.000)</p>
                  </div>
                </div>

                {/* Save Button */}
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
                        <span className="font-bold">Simpan Tiket</span>
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

export default CreateTicketPage; 