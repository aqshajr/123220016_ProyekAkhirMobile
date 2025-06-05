import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ChevronRight, MapPin, Clock, Minus, Plus, X, Calendar, ArrowLeft } from 'lucide-react';
import { ticketAPI, transactionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    validDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ticketAPI.getAllTickets();
      
      if (response && response.data && response.data.tickets) {
        setTickets(response.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Gagal memuat tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleOpenPurchaseModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowPurchaseModal(true);
    setFormData({
      quantity: 1,
      validDate: ''
    });
    setError('');
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedTicket(null);
    setFormData({
      quantity: 1,
      validDate: ''
    });
    setError('');
  };

  const handleQuantityChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + increment)
    }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      validDate: e.target.value
    }));
  };

  const handlePurchaseTicket = async () => {
    if (!formData.validDate) {
      setError('Tanggal kunjungan harus dipilih');
      return;
    }

    try {
      setPurchaseLoading(true);
      setError('');
      
      const transactionData = {
        ticketID: selectedTicket.ticketID,
        ticketQuantity: formData.quantity,
        validDate: formData.validDate
      };
      
      const response = await transactionAPI.createTransaction(transactionData);
      
      if (response && response.data) {
        alert('Tiket berhasil dibeli!');
        handleClosePurchaseModal();
        navigate('/my-tickets');
      }
    } catch (err) {
      console.error('Error purchasing ticket:', err);
      let errorMessage = 'Gagal membeli tiket. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const getTotalPrice = () => {
    if (!selectedTicket) return 0;
    return selectedTicket.price * formData.quantity;
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat tiket..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTickets} />;
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Daftar Tiket</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Pilih dan beli tiket untuk candi yang ingin dikunjungi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '120px', paddingRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#d4a464' }}>{tickets.length}</div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Tiket Tersedia</div>
            </div>
        </div>
      </div>

        {/* Tickets List */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {tickets.map((ticket) => (
              <div 
                key={ticket.ticketID} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px 16px 4px 4px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '280px'
                }}
                onClick={() => handleOpenPurchaseModal(ticket)}
              >
                {/* Border using repeating-linear-gradient */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      repeating-linear-gradient(0deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px) 0 0 / 2px 100%,
                      repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px) 0 0 / 100% 2px,
                      repeating-linear-gradient(0deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px) 100% 0 / 2px 100%,
                      repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px) 0 100% / 100% 2px
                    `,
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '16px 16px 4px 4px',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 85% 40%, 85% 60%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, 15% 60%, 15% 40%, 0% 40%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Ticket Header Strip */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #d4a464 0%, #b8956b 100%)',
                    padding: '12px 20px',
                    borderRadius: '14px 14px 0 0',
                    marginBottom: '2px',
                    height: '64px'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ height: '40px' }}>
                    <div className="text-white font-bold text-lg">
                      🎫 TIKET MASUK
                    </div>
                  </div>
                </div>

                {/* Perforated Line Effect */}
                <div 
                  style={{
                    height: '2px',
                    background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px)',
                    margin: '0 -2px'
                  }}
                />
                
                {/* Ticket Content */}
                <div className="p-3" style={{ paddingTop: '12px' }}>
                  {/* Temple Name - Main Title */}
                  <div className="text-center mb-2">
                    <div 
                      className="text-lg font-bold px-6 py-2 rounded-full inline-block mb-1"
                      style={{ backgroundColor: '#d4a464', color: 'white', marginTop: '10px' }}
                    >
                      {ticket.Temple?.title || 'Candi Bersejarah'}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-center" style={{ 
                      color: '#6c757d',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}>
                      {ticket.description}
                    </p>
                  </div>

                  {/* Price - Big and Prominent */}
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-green-600">
                        {formatPrice(ticket.price)}
                    </div>
                  </div>

                  {/* Ticket Stub - Bottom Section */}
                  <div 
                    className="pt-3 mt-3"
                    style={{ 
                      borderTop: '2px solid transparent',
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #d4a464 8px, #d4a464 16px)',
                      backgroundSize: '100% 2px',
                      backgroundPosition: 'left top',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ paddingTop: '11px' }}>
                      <div className="text-xs" style={{ color: '#6c757d' }}>
                        <div>VALID FOR</div>
                        <div className="font-semibold" style={{ color: '#243e3e' }}>SINGLE ENTRY</div>
                      </div>
                      
                      {/* Buy Button */}
                      <div className="flex items-center">
                  <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPurchaseModal(ticket);
                          }}
                          className="px-4 py-2 rounded-lg text-white font-bold text-sm border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{ 
                            backgroundColor: '#d4a464', 
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(212, 164, 100, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#c19653';
                            e.target.style.boxShadow = '0 4px 12px rgba(212, 164, 100, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#d4a464';
                            e.target.style.boxShadow = '0 2px 4px rgba(212, 164, 100, 0.3)';
                          }}
                        >
                          Beli Tiket
                  </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Holes on Sides */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '25.33334px',
                    height: '65.33334px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '50%',
                    border: '3px solid #d4a464'
                  }}
                />
                <div 
                  style={{
                    position: 'absolute',
                    right: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '25.33334px',
                    height: '65.33334px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '50%',
                    border: '3px solid #d4a464'
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#d4a464', opacity: 0.1 }}>
              <Ticket size={40} style={{ color: '#d4a464' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#243e3e' }}>
              Belum Ada Tiket Tersedia
            </h3>
            <p className="mb-6" style={{ color: '#6c757d' }}>
              Saat ini belum ada tiket yang tersedia. Silakan cek kembali nanti atau hubungi admin untuk informasi lebih lanjut.
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 mx-auto px-6 py-3 rounded-lg text-white font-bold transition-colors"
              style={{ backgroundColor: '#d4a464' }}
            >
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 relative" style={{ width: '480px', maxWidth: '90vw', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200" style={{ paddingTop: '24px' }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef7e6' }}>
                    <Ticket size={24} style={{ color: '#d4a464' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#243e3e', marginBottom: '5px' }}>Detail Pemesanan</h2>
                </div>
              </div>

              <div className="p-6">
              {/* Error Message */}
              {error && (
                  <div className="border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center space-x-3" style={{ backgroundColor: '#f8d7da' }}>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-sm font-medium">{error}</span>
                </div>
              )}

                <div className="space-y-6">
                {/* Date Selector */}
                <div>
                    <label className="block font-bold" style={{ color: '#243e3e', fontSize: '18px', marginBottom: '10px' }}>
                    Tanggal Kunjungan *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.validDate}
                      onChange={handleDateChange}
                      min={getMinDate()}
                        className="w-full pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 text-sm border"
                        style={{ 
                          border: '1px solid #d1d5db',
                          focusRingColor: '#d4a464',
                          backgroundColor: '#ffffff',
                          paddingLeft: '12px'
                        }}
                      required
                    />
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#6c757d' }}>
                      Pilih tanggal kunjungan yang diinginkan
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="block font-bold" style={{ color: '#243e3e', fontSize: '18px', marginBottom: '10px' }}>
                      Jumlah Tiket
                    </label>
                    <div className="flex items-center justify-center p-3 max-w-[200px] mx-auto">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 hover:opacity-80 rounded-lg transition-opacity disabled:opacity-40"
                        style={{ backgroundColor: '#d4a464', color: '#ffffff' }}
                        disabled={formData.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <div className="px-8 py-2 mx-4">
                        <span className="text-2xl font-bold text-center block min-w-[2rem]" style={{ color: '#243e3e' }}>
                          {formData.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:opacity-80 rounded-lg transition-opacity"
                        style={{ backgroundColor: '#d4a464', color: '#ffffff' }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                </div>

                {/* Total Price */}
                  <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#fef7e6', borderColor: '#d4a464' }}>
                  <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{ color: '#243e3e' }}>Total Pembayaran:</span>
                        <div className="text-sm" style={{ color: '#6c757d' }}>
                          {formData.quantity} tiket × {selectedTicket ? formatPrice(selectedTicket.price) : ''}
                        </div>
                      </div>
                      <div>
                        <span className="text-2xl font-bold" style={{ color: '#d4a464' }}>
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
                  <div className="flex space-x-4" style={{ marginTop: '24px' }}>
                <button
                  onClick={handleClosePurchaseModal}
                      className="flex items-center justify-center flex-1 py-3 text-sm font-bold rounded-lg text-white border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                      style={{ 
                        backgroundColor: '#d4a464', 
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(212, 164, 100, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#c19653';
                        e.target.style.boxShadow = '0 4px 12px rgba(212, 164, 100, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#d4a464';
                        e.target.style.boxShadow = '0 2px 4px rgba(212, 164, 100, 0.3)';
                      }}
                    >
                      Kembali
                </button>
                <button
                  onClick={handlePurchaseTicket}
                  disabled={purchaseLoading || !formData.validDate}
                      className="flex items-center justify-center flex-1 py-3 text-sm font-bold rounded-lg text-white border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: '#6c757d', 
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor = '#5a6268';
                          e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor = '#6c757d';
                          e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.3)';
                        }
                      }}
                >
                      {purchaseLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <Ticket size={18} className="mr-2" />
                          <span>Beli Sekarang</span>
                        </>
                      )}
                </button>
                  </div>

                  {/* Information Note */}
                  <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa', height: '87px' }}>
                    <p className="text-xs leading-relaxed" style={{ color: '#6c757d' }}>
                      <strong>Catatan:</strong> Tiket yang telah dibeli tidak dapat dibatalkan atau dikembalikan. 
                      Pastikan tanggal dan jumlah tiket sudah sesuai sebelum melakukan pembelian.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage; 