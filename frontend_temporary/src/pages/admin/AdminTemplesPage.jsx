import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Search, LogOut, Camera, Settings, Ticket } from 'lucide-react';
import { templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTemplesPage = () => {
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleDeleteTemple = async (templeId, templeName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus candi "${templeName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(templeId);
      await templeAPI.deleteTemple(templeId);
      
      // Refresh data setelah delete
      await fetchTemples();
      
      alert('Candi berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting temple:', err);
      alert('Gagal menghapus candi. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateTemple = () => {
    navigate('/admin/temples/create');
  };

  const handleEditTemple = (templeId) => {
    navigate(`/admin/temples/${templeId}/edit`);
  };

  const handleViewTemple = (templeId) => {
    navigate(`/temples/${templeId}`);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  // Filter temples berdasarkan search query
  const filteredTemples = temples.filter(temple =>
    temple.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    temple.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Memuat data candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTemples} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-20">
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
                Kelola data candi dan informasinya
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

      {/* Stats and Controls */}
      <div className="py-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{temples.length}</div>
              <div className="text-sm text-gray font-bold">Total Candi</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={18} className="absolute top-1/2 transform -translate-y-1/2 text-gray" style={{ left: '15px', marginTop: '12px' }} />
              <input
                type="text"
                placeholder="Cari candi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-6 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                style={{ width: '70vw', maxWidth: '342px', paddingLeft: '40px' }}
              />
            </div>
            <button
              onClick={handleCreateTemple}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span className="font-bold">Tambah Candi</span>
            </button>
          </div>
        </div>

        {/* Temples List */}
        {filteredTemples.length > 0 ? (
          <div className="grid grid-cols-3 gap-8">
            {filteredTemples.map((temple) => (
              <div 
                key={temple.templeID} 
                className="card cursor-pointer group hover:shadow-lg transition-all duration-300"
                style={{ height: '525px', display: 'flex', flexDirection: 'column' }}
                onClick={() => handleViewTemple(temple.templeID)}
              >
                <div className="relative" style={{ height: '368px', flexShrink: 0 }}>
                  <img 
                    src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                    alt={temple.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4" style={{ height: '157px', display: 'flex', flexDirection: 'column' }}>
                  {/* Title and Action Buttons */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-secondary text-lg flex-1 mr-4" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3',
                      alignSelf: 'center',
                      marginTop: '16px'
                    }}>
                      {temple.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemple(temple.templeID);
                        }}
                        className="p-2 bg-primary/10 rounded text-primary hover:bg-primary hover:text-white transition-colors border-0"
                        title="Edit Candi"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemple(temple.templeID, temple.title);
                        }}
                        disabled={deleteLoading === temple.templeID}
                        className="p-2 bg-red-50 rounded text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 border-0"
                        title="Hapus Candi"
                      >
                        {deleteLoading === temple.templeID ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                    height: '4.2em',
                    margin: 0
                  }}>
                    {temple.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {searchQuery ? 'Tidak Ada Candi yang Cocok' : 'Belum Ada Data Candi'}
            </h3>
            <p className="text-gray mb-6">
              {searchQuery 
                ? `Tidak ditemukan candi dengan kata kunci "${searchQuery}"`
                : 'Mulai dengan menambahkan candi pertama untuk sistem Artefacto.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateTemple}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Tambah Candi Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Bottom Navigation - Clean Design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50" style={{ width: '100vw', height: '70px' }}>
        <div className="flex h-full" style={{ width: '100%' }}>
          <div
            onClick={() => navigate('/admin/temples')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/temples'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <MapPin size={22} />
            <span className="text-xs font-medium">Candi</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/artifacts')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/artifacts'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Camera size={22} />
            <span className="text-xs font-medium">Artefak</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/tickets')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/tickets'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Ticket size={22} />
            <span className="text-xs font-medium">Tiket</span>
          </div>
          
          <div
            onClick={() => navigate('/admin/transactions')}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/admin/transactions'
                ? 'text-primary bg-primary/10' 
                : 'text-gray hover:text-primary hover:bg-primary/5'
            }`}
            style={{ borderRight: 'none' }}
          >
            <Settings size={22} />
            <span className="text-xs font-medium">Transaksi</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminTemplesPage; 