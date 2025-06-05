import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Palette, Ruler, Layers, Edit, MapPin, CheckCircle, Check } from 'lucide-react';
import { artifactAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ArtifactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [artifact, setArtifact] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtifactData();
  }, [id]);

  const fetchArtifactData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await artifactAPI.getArtifactById(id);
      console.log('Artifact detail response:', response);

      if (response && response.data && response.data.artifact) {
        setArtifact(response.data.artifact);
        
        // Get bookmark status from server response
        setIsBookmarked(response.data.artifact.isBookmarked || false);
        
        // Get read status from server response
        setIsRead(response.data.artifact.isRead || false);
      }

    } catch (err) {
      console.error('Error fetching artifact data:', err);
      setError('Gagal memuat data artefak. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const newBookmarkStatus = !isBookmarked;
      setIsBookmarked(newBookmarkStatus);
      
      // Call bookmark API
      await artifactAPI.bookmarkArtifact(id);
      console.log('Bookmark toggled:', newBookmarkStatus);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setIsBookmarked(!isBookmarked); // Revert on error
    }
  };

  const markAsRead = async () => {
    try {
      setIsRead(true);
      
      // Call read status API
      await artifactAPI.markAsRead(id);
      console.log('Marked as read:', id);
    } catch (err) {
      console.error('Error marking as read:', err);
      setIsRead(false); // Revert on error
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat detail artefak..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchArtifactData} />;
  }

  if (!artifact) {
    return <ErrorMessage message="Artefak tidak ditemukan." />;
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
                <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>{artifact.title}</h2>
                <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Detail lengkap artefak bersejarah</p>
              </div>
            </div>
            
            {/* Admin Edit Button */}
            {isAdmin() && (
              <div style={{ marginRight: '100px' }}>
                <button
                  onClick={() => navigate(`/admin/artifacts/${id}/edit`)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span className="font-bold">Edit Artefak</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '300px', paddingRight: '300px' }}>
        {/* Artifact Image - Enhanced */}
        <div className="relative rounded-xl overflow-hidden mb-6" style={{ height: '500px' }}>
          <img 
            src={artifact.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center'}
            alt={artifact.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content - Single Column */}
        <div className="space-y-6">
          {/* Artifact Title & Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-secondary mb-4">Tentang Artefak</h3>
            
            {/* Action Buttons - Only for regular users */}
            {!isAdmin() && (
              <div className="flex items-center mb-4" style={{ gap: '16px' }}>
                <button
                  onClick={markAsRead}
                  className={`btn ${isRead ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
                >
                  {isRead ? <CheckCircle size={18} /> : <Check size={18} />}
                  <span className="font-bold">{isRead ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}</span>
                </button>
                
                <button
                  onClick={toggleBookmark}
                  className={`btn ${isBookmarked ? 'btn-primary' : 'btn-secondary'} flex items-center space-x-2`}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  <span className="font-bold">{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
                </button>
              </div>
            )}

            <p className="text-gray leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>{artifact.description}</p>
          </div>

          {/* Artifact Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-secondary mb-4">Detail Artefak</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Period */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: '50px' }}>
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary mb-1" style={{ marginLeft: '16px' }}>Periode</h4>
                  <p className="text-gray" style={{ marginLeft: '16px' }}>{artifact.detailPeriod || 'Informasi periode tidak tersedia'}</p>
                </div>
              </div>

              {/* Material */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: '50px' }}>
                  <Layers size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary mb-1" style={{ marginLeft: '16px' }}>Material</h4>
                  <p className="text-gray" style={{ marginLeft: '16px' }}>{artifact.detailMaterial || 'Informasi material tidak tersedia'}</p>
                </div>
              </div>

              {/* Size */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: '50px' }}>
                  <Ruler size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary mb-1" style={{ marginLeft: '16px' }}>Ukuran</h4>
                  <p className="text-gray" style={{ marginLeft: '16px' }}>{artifact.detailSize || 'Informasi ukuran tidak tersedia'}</p>
                </div>
              </div>

              {/* Style */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: '50px' }}>
                  <Palette size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary mb-1" style={{ marginLeft: '16px' }}>Gaya</h4>
                  <p className="text-gray" style={{ marginLeft: '16px' }}>{artifact.detailStyle || 'Informasi gaya tidak tersedia'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Fact */}
          {artifact.funfactTitle && artifact.funfactDescription && (
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ borderLeft: '4px solid #d4a464' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#d4a464' }}>Funfact !! {artifact.funfactTitle}</h3>
              <p className="text-secondary leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>{artifact.funfactDescription}</p>
            </div>
          )}

          {/* Location Information */}
          {artifact.locationUrl && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-secondary mb-4">Lokasi Penemuan</h3>
              <a
                href={artifact.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary-yellow transition-colors font-medium"
              >
                <MapPin size={16} className="mr-2" />
                <span>Lihat Lokasi di Maps</span>
              </a>
            </div>
          )}

          {/* Additional Info */}
          {artifact.additionalInfo && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-secondary mb-4">Informasi Tambahan</h3>
              <p className="text-gray leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>{artifact.additionalInfo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactDetailPage; 