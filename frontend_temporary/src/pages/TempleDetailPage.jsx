import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BookOpen, Bookmark, BookmarkCheck, Edit, Heart, Eye } from 'lucide-react';
import { templeAPI, artifactAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TempleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [temple, setTemple] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [readArtifacts, setReadArtifacts] = useState(new Set());
  const [bookmarkedArtifacts, setBookmarkedArtifacts] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTempleData();
  }, [id]);

  const fetchTempleData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Mengambil detail candi dari server
      const templeResponse = await templeAPI.getTempleById(id);

      if (templeResponse && templeResponse.data && templeResponse.data.temple) {
        setTemple(templeResponse.data.temple);
        
        // Mengambil artefak secara terpisah menggunakan artifactAPI dengan filter templeId
        try {
          const artifactsResponse = await artifactAPI.getAllArtifacts();
          
          if (artifactsResponse && artifactsResponse.data && artifactsResponse.data.artifacts) {
            // Filter artefak untuk candi ini
            const templeArtifacts = artifactsResponse.data.artifacts.filter(
              artifact => artifact.templeID === parseInt(id)
            );
            console.log(`Found ${templeArtifacts.length} artifacts for temple ${id}`);
            setArtifacts(templeArtifacts);
            
            // Mengambil status baca dan bookmark dari respons server
            const readIds = templeArtifacts
              .filter(artifact => artifact.isRead)
              .map(artifact => artifact.artifactID);
            setReadArtifacts(new Set(readIds));
            
            const bookmarkedIds = templeArtifacts
              .filter(artifact => artifact.isBookmarked)
              .map(artifact => artifact.artifactID);
            setBookmarkedArtifacts(new Set(bookmarkedIds));
          } else {
            setArtifacts([]);
          }
        } catch (artifactError) {
          console.error('Error fetching artifacts:', artifactError);
          setArtifacts([]);
        }
      }

    } catch (err) {
      console.error('Error fetching temple data:', err);
      setError('Gagal memuat data candi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtifactClick = (artifact) => {
    navigate(`/artifacts/${artifact.artifactID}`);
  };

  const markAsRead = async (artifactId) => {
    try {
      const newReadArtifacts = new Set(readArtifacts);
      newReadArtifacts.add(artifactId);
      setReadArtifacts(newReadArtifacts);
      
      // Panggil API tandai sebagai dibaca
      await artifactAPI.markAsRead(artifactId);
    } catch (err) {
      console.error('Error marking as read:', err);
      // Kembalikan jika ada kesalahan
      const revertedReadArtifacts = new Set(readArtifacts);
      revertedReadArtifacts.delete(artifactId);
      setReadArtifacts(revertedReadArtifacts);
    }
  };

  const toggleBookmark = async (artifactId) => {
    try {
      const newBookmarkedArtifacts = new Set(bookmarkedArtifacts);
      if (newBookmarkedArtifacts.has(artifactId)) {
        newBookmarkedArtifacts.delete(artifactId);
      } else {
        newBookmarkedArtifacts.add(artifactId);
      }
      setBookmarkedArtifacts(newBookmarkedArtifacts);
      
      // Panggil API bookmark
      await artifactAPI.bookmarkArtifact(artifactId);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Kembalikan jika ada kesalahan
      setBookmarkedArtifacts(bookmarkedArtifacts);
    }
  };

  const explorationProgress = artifacts.length > 0 ? (readArtifacts.size / artifacts.length) * 100 : 0;

  if (isLoading) {
    return <LoadingSpinner text="Memuat detail candi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTempleData} />;
  }

  if (!temple) {
    return <ErrorMessage message="Candi tidak ditemukan." />;
  }

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center justify-between" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }} className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-secondary flex items-center space-x-2 mr-4"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>{temple.title}</h2>
                <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Detail informasi dan artefak candi</p>
              </div>
            </div>
            
            {/* Progress Display */}
            {!isAdmin() && artifacts.length > 0 && (
              <div style={{ marginRight: '100px', height: '44px' }} className="bg-white rounded-xl px-6 shadow-sm flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold" style={{ color: '#d4a464' }}>
                    {Math.round(explorationProgress)}%
                  </div>
                  <div className="text-sm" style={{ color: '#6c757d' }}>
                    <span className="font-bold">Progress Eksplorasi</span>
                    <div className="text-xs">{readArtifacts.size} dari {artifacts.length} artefak</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Edit Button */}
            {isAdmin() && (
              <div style={{ marginRight: '100px' }}>
                <button
                  onClick={() => navigate(`/admin/temples/${id}/edit`)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span className="font-bold">Edit Candi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '300px', paddingRight: '300px' }}>
        {/* Temple Image - Enhanced */}
        <div className="relative rounded-xl overflow-hidden mb-6" style={{ height: '600px' }}>
          <img 
            src={temple.imageUrl || 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=800&h=400&fit=crop&crop=center'}
            alt={temple.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3b1?w=800&h=400&fit=crop&crop=center';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content - Single Column */}
        <div className="space-y-6">
          {/* Temple Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-secondary mb-4">Tentang Candi</h3>
            <p className="text-gray leading-relaxed mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>{temple.description}</p>
            
            {/* Location Link */}
            {temple.locationUrl && (
              <a
                href={temple.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary-yellow transition-colors font-medium"
              >
                <MapPin size={16} className="mr-2" />
                <span>Lihat Lokasi di Maps</span>
              </a>
            )}
          </div>

          {/* Fun Fact */}
          {temple.funfactTitle && (
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ borderLeft: '4px solid #d4a464' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a464' }}>Funfact !! {temple.funfactTitle}</h3>
              <p className="text-secondary leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>{temple.funfactDescription}</p>
            </div>
          )}

          {/* Artifacts Section */}
          {!isAdmin() && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-secondary mb-6">Jelajahi Artefak</h3>
              
              {artifacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {artifacts.map((artifact) => {
                    const isRead = readArtifacts.has(artifact.artifactID);
                    const isBookmarked = bookmarkedArtifacts.has(artifact.artifactID);
                    
                    return (
                      <div 
                        key={artifact.artifactID}
                        className="overflow-hidden shadow-sm transition-all duration-300 cursor-pointer transform will-change-transform"
                        style={{ 
                          height: '280px',
                          backgroundColor: 'white',
                          border: '1px solid #f3f4f6',
                          borderRadius: '24px'
                        }}
                        onClick={(e) => {
                          // Hanya navigasi jika tidak mengklik pada tombol bookmark
                          if (!e.target.closest('button')) {
                            handleArtifactClick(artifact);
                          }
                        }}
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
                            
                            {/* Status Badge - Left Top */}
                            <div 
                              className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full shadow-sm"
                              style={{ 
                                backgroundColor: isRead ? '#22543d' : '#d4a464',
                                border: '2px solid white'
                              }}
                            >
                              {isRead ? (
                                <Eye size={14} style={{ color: 'white' }} fill="white" />
                              ) : (
                                <BookOpen size={14} style={{ color: 'white' }} fill="white" />
                              )}
                            </div>
                            
                            {/* Bookmark Button - Right Top */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                console.log('Heart clicked for artifact:', artifact.artifactID);
                                toggleBookmark(artifact.artifactID);
                              }}
                              className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
                              title={isBookmarked ? "Hapus dari bookmark" : "Tambah ke bookmark"}
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
                                  {temple.title}
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
                                    e.preventDefault();
                                    console.log('Bookmark icon clicked for artifact:', artifact.artifactID);
                                    toggleBookmark(artifact.artifactID);
                                  }}
                                  title={isBookmarked ? "Hapus dari bookmark" : "Tambah ke bookmark"}
                                >
                                  <Bookmark size={18} style={{ color: isBookmarked ? '#22543d' : '#d4a464' }} fill={isBookmarked ? '#22543d' : 'none'} />
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
                            
                            {/* Status at Bottom */}
                            <div className="mt-auto">
                              <span 
                                className="text-xs py-1 rounded-full font-bold"
                                style={{ 
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  backgroundColor: '#fef3c7',
                                  color: '#d4a464'
                                }}
                              >
                                {isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-secondary mb-2">Belum Ada Artefak</h4>
                  <p className="text-gray">Artefak untuk candi ini belum tersedia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempleDetailPage; 