import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Zap, Eye, Bookmark } from 'lucide-react';
import { mlAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { artifactAPI } from '../utils/api';

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
      setScanResult(null);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setSelectedImage(blob);
        setPreviewImage(canvas.toDataURL());
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Pilih gambar terlebih dahulu');
      return;
    }

    try {
      setIsScanning(true);
      setError('');
      setScanResult(null);

      const formData = new FormData();
      formData.append('image', selectedImage);

      console.log('Scanning artifact...');
      const response = await mlAPI.predictArtifact(formData);
      console.log('Scan response:', response);

      if (response && response.data) {
        // Handle ML API response format: {prediction: 'brahma', confidence: 0.77}
        const mlResult = response.data;
        console.log('ML Result:', mlResult);
        
        if (mlResult.prediction && mlResult.confidence) {
          // Set confidence threshold - only show as recognized if confidence > 50%
          const confidenceThreshold = 0.5;
          
          if (mlResult.confidence >= confidenceThreshold) {
            // Create a scan result object that the UI can use
            const scanResultData = {
              prediction: mlResult.prediction,
              confidence: mlResult.confidence,
              // For now, we'll show the prediction as detected artifact
              artifact: {
                title: mlResult.prediction.charAt(0).toUpperCase() + mlResult.prediction.slice(1),
                description: `Artefak terdeteksi sebagai ${mlResult.prediction} dengan AI Machine Learning.`,
                period: 'Klasik',
                artifactID: mlResult.prediction // Use prediction as ID for now
              }
            };
            setScanResult(scanResultData);
          } else {
            // Low confidence - show as not recognized but include prediction info
            setScanResult({ 
              artifact: null, 
              prediction: mlResult.prediction, 
              confidence: mlResult.confidence,
              lowConfidence: true
            });
          }
        } else {
          // No prediction or low confidence - show as not recognized
          setScanResult({ artifact: null, prediction: null, confidence: 0 });
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Scan error:', err);
      
      // Handle different types of errors
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Tidak dapat terhubung ke server AI. Pastikan koneksi internet Anda stabil dan coba lagi nanti.');
      } else if (err.response?.status === 400) {
        setError('Format gambar tidak valid. Gunakan gambar JPG atau PNG.');
      } else if (err.response?.status === 500) {
        setError('Server sedang mengalami masalah. Silakan coba lagi nanti.');
      } else {
        setError('Gagal memindai artefak. Silakan coba lagi.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBookmark = async (artifactId) => {
    try {
      // Call bookmark API
      await artifactAPI.bookmarkArtifact(artifactId);
      
      // Toggle bookmark status in scan result
      setScanResult(prev => ({
        ...prev,
        isBookmarked: !prev.isBookmarked
      }));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Gagal mengubah bookmark. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-light pb-16">
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Scan Artefak</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Identifikasi artefak dengan teknologi AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Camera Modal */}
        {showCamera && (
          <div 
            className="fixed inset-0 bg-black flex flex-col"
            style={{ 
              zIndex: 9999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
          >
            <div className="flex items-center justify-end p-4 bg-black/50" style={{ zIndex: 10000 }}>
              <button
                onClick={stopCamera}
                className="btn btn-secondary flex items-center justify-center"
                style={{ width: '40px', height: '40px', padding: '0', zIndex: 10001 }}
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Camera preview container - 16:9 ratio */}
            <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ zIndex: 9999 }}>
              <div 
                className="relative rounded-lg overflow-hidden shadow-md mb-6"
                style={{ 
                  width: '300px', 
                  height: '533px',
                  backgroundColor: '#000'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ 
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
              
              {/* Capture button below preview */}
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-300 hover:bg-gray-100 transition-all"
                style={{ zIndex: 10002 }}
              >
                <Camera size={28} className="text-primary" />
              </button>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Upload Section */}
        {true && (
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-secondary mb-4">Pilih Gambar Artefak</h2>
            
            {previewImage ? (
              <div className="mb-4">
                {/* Delete Button - Above image with logout style */}
                {!scanResult && (
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={resetScan}
                      className="btn btn-secondary flex items-center justify-center"
                      style={{ width: '40px', height: '40px', padding: '0' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                {/* Fixed size image preview - 16:9 ratio */}
                <div className="flex justify-center mb-4">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="object-cover rounded-lg shadow-md"
                    style={{ 
                      width: '300px !important', 
                      height: '533px !important',
                      maxWidth: '300px',
                      maxHeight: '533px',
                      minWidth: '300px',
                      minHeight: '533px'
                    }}
                  />
                </div>
                
                {/* Scan Result - Simple version below image */}
                {scanResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {scanResult.artifact ? (
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-secondary mb-2">
                          {scanResult.artifact.title}
                        </h4>
                        <div className="flex items-center justify-center space-x-4 mb-2">
                          <span className="text-sm text-gray">
                            Confidence: {Math.round(scanResult.confidence * 100)}%
                          </span>
                        </div>
                        {/* Simple Confidence Bar */}
                        <div className="max-w-xs mx-auto">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                scanResult.confidence >= 0.8 ? 'bg-green-500' :
                                scanResult.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.round(scanResult.confidence * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : scanResult.lowConfidence ? (
                      <div className="text-center">
                        <h4 className="text-md font-medium text-gray-600 mb-2">
                          Kemungkinan: {scanResult.prediction}
                        </h4>
                        <div className="flex items-center justify-center space-x-4 mb-2">
                          <span className="text-sm text-gray">
                            Confidence: {Math.round(scanResult.confidence * 100)}% (Rendah)
                          </span>
                        </div>
                        <div className="max-w-xs mx-auto">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-red-400"
                              style={{ width: `${Math.round(scanResult.confidence * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <h4 className="text-md font-medium text-gray-600">
                          Artefak Tidak Dikenali
                        </h4>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Scan Again Button - Full Width */}
                {scanResult && (
                  <div className="mt-4">
                    <button
                      onClick={resetScan}
                      className="w-full btn btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Zap size={16} />
                      <span>Scan Lagi</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary transition-colors"
                >
                  <Camera size={32} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-secondary">Ambil Foto</span>
                  <span className="text-xs text-gray">Gunakan kamera</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary transition-colors"
                >
                  <Upload size={32} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-secondary">Upload Gambar</span>
                  <span className="text-xs text-gray">Dari galeri</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedImage && !scanResult && (
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memindai...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Scan Artefak</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isScanning && (
          <div className="bg-white rounded-xl p-8">
            <LoadingSpinner text="Menganalisis artefak dengan AI..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage; 