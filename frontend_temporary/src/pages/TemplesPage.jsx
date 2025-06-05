import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Search } from 'lucide-react';
import { templeAPI, artifactAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TemplesPage = () => {
  const [temples, setTemples] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [templeProgress, setTempleProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching temples and artifacts...');
      
      // Mengambil data candi dari server
      const templesResponse = await templeAPI.getAllTemples();
      console.log('Temples API response:', templesResponse);
      
      // Mengambil data artefak dari server
      const artifactsResponse = await artifactAPI.getAllArtifacts();
      console.log('Artifacts API response:', artifactsResponse);
      
      let templesData = [];
      let artifactsData = [];
      
      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        templesData = templesResponse.data.temples;
        setTemples(templesData);
      }
      
      if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
        artifactsData = artifactsResponse.data.artifacts;
        setArtifacts(artifactsData);
      }
      
      // Kalkulasi progress untuk setiap candi menggunakan data server
      const progressData = {};
      templesData.forEach(temple => {
        const templeArtifacts = artifactsData.filter(artifact => artifact.templeID === temple.templeID);
        // Gunakan isRead dari data server bukan localStorage
        const readArtifacts = templeArtifacts.filter(artifact => artifact.isRead === true);
        const progress = templeArtifacts.length > 0 ? (readArtifacts.length / templeArtifacts.length) * 100 : 0;
        
        progressData[temple.templeID] = {
          progress: Math.round(progress),
          readCount: readArtifacts.length,
          totalCount: templeArtifacts.length
        };
      });
      console.log('Progress tracking:', isAuthenticated ? 'authenticated user' : 'guest user');
      if (isAuthenticated) {
        console.log('Progress data (from server):', progressData);
      }
      setTempleProgress(progressData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTempleClick = (temple) => {
    navigate(`/temples/${temple.templeID}`);
  };

  // Filter temples berdasarkan search query
  const filteredTemples = temples.filter(temple =>
    temple.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    temple.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Memuat daftar candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Jelajahi Candi</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Temukan keajaiban warisan budaya Indonesia</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '120px', paddingRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          {/* Total Temples Counter */}
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#d4a464' }}>
                {temples.length}
              </div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Total Candi</div>
            </div>
          </div>

          {/* Search Input */}
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
        </div>

        {filteredTemples.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {filteredTemples.map((temple) => {
              const progressData = templeProgress[temple.templeID] || {
                progress: 0,
                readCount: 0,
                totalCount: 0
              };
              console.log(`Temple ${temple.templeID} progress:`, progressData);
              
              return (
                <div 
                  key={temple.templeID}
                  onClick={() => handleTempleClick(temple)}
                  className="card cursor-pointer group hover:shadow-lg transition-all duration-300"
                  style={{ height: '480px', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Temple Image - 70% */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl" style={{ height: '336px', flexShrink: 0 }}>
                    <img 
                      src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center'}
                      alt={temple.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=400&h=300&fit=crop&crop=center';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Temple Info - 30% */}
                  <div className="p-6" style={{ height: '144px', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="font-semibold text-lg text-secondary mb-3">
                      {temple.title}
                    </h3>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray">
                          {isAuthenticated ? 'Progress Eksplorasi' : 'Total Artefak'}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {isAuthenticated 
                            ? `${progressData.progress}%` 
                            : `${progressData.totalCount} item`
                          }
                        </span>
                      </div>
                      {/* Progress Bar Visual - Fixed logic */}
                      {isAuthenticated ? (
                        <>
                          <div className="w-full bg-gray-200 rounded-full mb-2" style={{ height: '8px', backgroundColor: '#e5e7eb' }}>
                            <div 
                              className="rounded-full transition-all duration-500"
                              style={{ 
                                height: '8px',
                                width: `${progressData.progress}%`,
                                background: progressData.progress > 0 ? 'linear-gradient(90deg, #d4a464 0%, #b8956b 100%)' : 'transparent'
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray">
                            {progressData.readCount} dari {progressData.totalCount} artefak
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-full bg-gray-200 rounded-full mb-2" style={{ height: '8px', backgroundColor: '#e5e7eb' }}>
                            <div 
                              className="rounded-full transition-all duration-500"
                              style={{ 
                                height: '8px',
                                width: '100%',
                                background: 'linear-gradient(90deg, #d4a464 0%, #b8956b 100%)'
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray">
                            Login untuk tracking progress
                          </p>
                        </>
                      )}
                    </div>
                    
                    {/* Footer - Removed text, keep minimal */}
                    <div className="flex items-center justify-end" style={{ marginTop: 'auto' }}>
                      <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {searchQuery ? 'Tidak Ada Candi yang Cocok' : 'Belum Ada Candi'}
            </h3>
            <p className="text-gray">
              {searchQuery 
                ? `Tidak ditemukan candi dengan kata kunci "${searchQuery}"`
                : 'Belum ada data candi yang tersedia saat ini.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplesPage; 