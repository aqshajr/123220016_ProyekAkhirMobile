import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Eye, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { artifactAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const BookmarkPage = () => {
  const [bookmarkedArtifacts, setBookmarkedArtifacts] = useState([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarkedArtifacts();
  }, []);

  useEffect(() => {
    // Filter artifacts based on search query
    if (searchQuery.trim() === '') {
      setFilteredArtifacts(bookmarkedArtifacts);
    } else {
      const filtered = bookmarkedArtifacts.filter(artifact =>
        artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.Temple?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArtifacts(filtered);
    }
  }, [searchQuery, bookmarkedArtifacts]);

  const fetchBookmarkedArtifacts = async () => {
    try {
      setIsLoading(true);
      // Ambil artifacts yang sudah di-bookmark oleh user ini dari server
      const response = await artifactAPI.getAllArtifacts();
      
      if (response && response.data && response.data.artifacts) {
        // Filter hanya artifacts yang di-bookmark oleh user ini (dari server response)
        const bookmarked = response.data.artifacts.filter(artifact => 
          artifact.isBookmarked === true
        );
        setBookmarkedArtifacts(bookmarked);
      } else {
        setBookmarkedArtifacts([]);
      }
    } catch (err) {
      console.error('Error fetching bookmarked artifacts:', err);
      setError('Gagal memuat bookmark Anda. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (artifactId) => {
    try {
      // Hapus bookmark dari server
      await artifactAPI.bookmarkArtifact(artifactId);
      
      // Update state local
      setBookmarkedArtifacts(prev => 
        prev.filter(artifact => artifact.artifactID !== artifactId)
      );
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Gagal menghapus bookmark. Silakan coba lagi.');
    }
  };

  const handleViewArtifact = (artifactId) => {
    navigate(`/artifacts/${artifactId}`);
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat bookmark Anda..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBookmarkedArtifacts} />;
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Bookmark Saya</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Artefak yang Anda simpan untuk dibaca nanti</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '120px', paddingRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#22543d' }}>{filteredArtifacts.length}</div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Bookmark Tersimpan</div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute top-1/2 transform -translate-y-1/2 text-gray-400" style={{ left: '15px', marginTop: '12px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bookmark artefak..."
              className="pl-10 pr-6 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              style={{ width: '400px', paddingLeft: '40px' }}
            />
          </div>
        </div>

        {filteredArtifacts.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {filteredArtifacts.map((artifact) => (
              <div 
                key={artifact.artifactID} 
                className="overflow-hidden shadow-sm transition-all duration-300 cursor-pointer transform will-change-transform"
                style={{ 
                  height: '280px',
                  backgroundColor: 'white',
                  border: '1px solid #f3f4f6',
                  borderRadius: '24px'
                }}
                onClick={() => handleViewArtifact(artifact.artifactID)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98) translateY(0px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                }}
              >
                <div className="flex h-full">
                  {/* Image Section - 1/3 width */}
                  <div className="relative" style={{ width: '33.333333%' }}>
                    <img 
                      src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center'}
                      alt={artifact.title}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '24px 0 0 24px' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center';
                      }}
                    />
                    
                    {/* Bookmark Badge */}
                    <div 
                      className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full shadow-sm"
                      style={{ 
                        backgroundColor: '#22543d',
                        border: '2px solid white'
                      }}
                    >
                      <Bookmark size={14} style={{ color: 'white' }} fill="white" />
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(artifact.artifactID);
                      }}
                      className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
                      title="Hapus dari bookmark"
                    >
                      <Heart size={14} className="text-red-500 group-hover:text-red-600" fill="currentColor" />
                    </button>
                  </div>
                  
                  {/* Content Section - 2/3 width */}
                  <div 
                    className="flex flex-col justify-between p-6"
                    style={{ width: '66.666667%' }}
                  >
                    {/* Content */}
                    <div>
                      {/* Temple Name */}
                      <div className="flex items-center mb-2" style={{ marginBottom: '0px' }}>
                        <span className="font-bold" style={{ color: '#22543d', fontSize: '16px' }}>
                          {artifact.Temple?.title || 'Candi Bersejarah'}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <div className="flex items-start justify-between mb-3" style={{ paddingTop: '0px' }}>
                        <h3 className="font-bold text-lg leading-tight flex-1" style={{ color: '#1a1a1a', marginBottom: '0px', paddingTop: '5px' }}>
                          {artifact.title}
                        </h3>
                        
                        {/* Bookmark Icon - Direct icon without background box */}
                        <button 
                          className="transition-all duration-300 hover:scale-125 active:scale-95 ml-3 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(artifact.artifactID);
                          }}
                          title="Hapus dari bookmark"
                        >
                          <Bookmark size={18} style={{ color: '#22543d' }} fill="#22543d" />
                        </button>
                      </div>
                      
                      {/* Description - Max 2 lines */}
                      <p 
                        className="text-sm leading-relaxed mb-4"
                        style={{ 
                          color: '#6b7280',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {artifact.description}
                      </p>
                      
                      {/* Fun Fact Section */}
                      {artifact.funfactTitle && artifact.funfactDescription && (
                        <div>
                          <h4 className="font-bold mb-2" style={{ color: '#d4a464', fontSize: '16px', marginBottom: '0px' }}>
                            {artifact.funfactTitle}
                          </h4>
                          <p 
                            className="leading-relaxed"
                            style={{ 
                              color: '#9ca3af',
                              lineHeight: '1.4',
                              fontSize: '14px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {artifact.funfactDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarkedArtifacts.length > 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Tidak Ada Hasil</h3>
            <p className="text-gray mb-6">
              Tidak ditemukan bookmark yang sesuai dengan pencarian "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-primary"
            >
              Hapus Filter
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Bookmark</h3>
            <p className="text-gray mb-6">
              Anda belum menyimpan artefak apapun. Jelajahi artefak dan simpan yang menarik untuk Anda.
            </p>
            <button
              onClick={() => navigate('/temples')}
              className="btn btn-primary"
            >
              Jelajahi Artefak
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage; 