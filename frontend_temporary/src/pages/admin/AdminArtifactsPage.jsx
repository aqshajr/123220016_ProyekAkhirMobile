import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, Calendar, LogOut, MapPin, Camera, Settings, Ticket, ChevronDown } from 'lucide-react';
import { artifactAPI, templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminArtifactsPage = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [temples, setTemples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch artifacts and temples simultaneously
      const [artifactsResponse, templesResponse] = await Promise.all([
        artifactAPI.getAllArtifacts(),
        templeAPI.getAllTemples()
      ]);
      
      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        setArtifacts(artifactsResponse.data.artifacts);
      } else {
        setArtifacts([]);
      }

      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        setTemples(templesResponse.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data artefak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArtifact = async (artifactId, artifactName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus artefak "${artifactName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(artifactId);
      await artifactAPI.deleteArtifact(artifactId);
      
      // Refresh data setelah delete
      await fetchData();
      
      alert('Artefak berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting artifact:', err);
      alert('Gagal menghapus artefak. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateArtifact = () => {
    navigate('/admin/artifacts/create');
  };

  const handleEditArtifact = (artifactId) => {
    navigate(`/admin/artifacts/${artifactId}/edit`);
  };

  const handleViewArtifact = (artifactId) => {
    navigate(`/artifacts/${artifactId}`);
  };

  const getTempleName = (templeId) => {
    const temple = temples.find(t => t.templeID === templeId);
    return temple ? temple.title : 'Unknown Temple';
  };

  // Filter artifacts by selected temple and search query
  const filteredArtifacts = artifacts.filter(artifact => {
    const templeMatch = !selectedTemple || artifact.templeID === parseInt(selectedTemple);
    const searchMatch = !searchQuery || 
      artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTempleName(artifact.templeID).toLowerCase().includes(searchQuery.toLowerCase());
    
    return templeMatch && searchMatch;
  });

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data artefak..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
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
                Kelola data artefak dan informasinya
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
              <div className="text-3xl font-bold text-primary">{artifacts.length}</div>
              <div className="text-sm text-gray font-bold">Total Artefak</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Custom Temple Dropdown */}
            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
                style={{ height: '44px', width: '186px' }}
              >
                <span className="text-gray-700" style={{ paddingLeft: '10px' }}>
                  {selectedTemple ? temples.find(t => t.templeID === parseInt(selectedTemple))?.title : 'Semua Candi'}
                </span>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => {
                      setSelectedTemple('');
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                  >
                    Semua Candi
                  </div>
                  {temples.map((temple) => (
                    <div
                      key={temple.templeID}
                      onClick={() => {
                        setSelectedTemple(temple.templeID.toString());
                        setIsDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                    >
                      {temple.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <Search size={18} className="absolute top-1/2 transform -translate-y-1/2 text-gray" style={{ left: '15px', marginTop: '12px' }} />
              <input
                type="text"
                placeholder="Cari artefak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-6 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                style={{ width: '70vw', maxWidth: '342px', paddingLeft: '40px' }}
              />
            </div>
            
            <button
              onClick={handleCreateArtifact}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span className="font-bold">Tambah Artefak</span>
            </button>
          </div>
        </div>

        {(selectedTemple || searchQuery) && (
          <div className="text-sm text-gray mb-6">
            Menampilkan {filteredArtifacts.length} dari {artifacts.length} artefak
          </div>
        )}

        {/* Artifacts List */}
        {filteredArtifacts.length > 0 ? (
          <div className="grid grid-cols-3 gap-8">
            {filteredArtifacts.map((artifact) => (
              <div 
                key={artifact.artifactID} 
                className="card cursor-pointer group hover:shadow-lg transition-all duration-300"
                style={{ height: '525px', display: 'flex', flexDirection: 'column' }}
                onClick={() => handleViewArtifact(artifact.artifactID)}
              >
                <div className="relative" style={{ height: '368px', flexShrink: 0 }}>
                  <img 
                    src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center'}
                    alt={artifact.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="p-4" style={{ height: '157px', display: 'flex', flexDirection: 'column' }}>
                  {/* Temple Name Badge */}
                  <div>
                    <span className="text-xs bg-primary/10 text-primary py-1 rounded-full" style={{ paddingLeft: '0px', paddingRight: '8px' }}>
                      {getTempleName(artifact.templeID)}
                    </span>
                  </div>
                  
                  {/* Title and Action Buttons */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-secondary text-lg flex-1 mr-4" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3',
                      alignSelf: 'center'
                    }}>
                      {artifact.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArtifact(artifact.artifactID);
                        }}
                        className="p-2 bg-primary/10 rounded text-primary hover:bg-primary hover:text-white transition-colors border-0"
                        title="Edit Artefak"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArtifact(artifact.artifactID, artifact.title);
                        }}
                        disabled={deleteLoading === artifact.artifactID}
                        className="p-2 bg-red-50 rounded text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 border-0"
                        title="Hapus Artefak"
                      >
                        {deleteLoading === artifact.artifactID ? (
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
                    {artifact.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {selectedTemple || searchQuery ? 'Tidak Ada Artefak yang Cocok' : 'Belum Ada Data Artefak'}
            </h3>
            <p className="text-gray mb-6">
              {selectedTemple || searchQuery
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan menambahkan artefak pertama untuk sistem Artefacto.'
              }
            </p>
            {!selectedTemple && !searchQuery && (
              <button
                onClick={handleCreateArtifact}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Tambah Artefak Pertama</span>
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

export default AdminArtifactsPage; 