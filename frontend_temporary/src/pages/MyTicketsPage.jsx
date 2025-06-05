import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { ownedTicketAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOwnedTickets();
  }, []);

  const fetchOwnedTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ownedTicketAPI.getOwnedTickets();
      
      if (response && response.data && response.data.ownedTickets) {
        // Process ticket expiration first
        const processedTickets = processTicketExpiration(response.data.ownedTickets);
        
        // Sort tickets: active ones first, expired and used ones last
        const activeTickets = processedTickets.filter(ticket => ticket.usageStatus === 'Belum Digunakan');
        const expiredTickets = processedTickets.filter(ticket => ticket.usageStatus === 'Kadaluarsa');
        const usedTickets = processedTickets.filter(ticket => ticket.usageStatus === 'Sudah Digunakan');
        const sortedTickets = [...activeTickets, ...expiredTickets, ...usedTickets];
        
        setTickets(sortedTickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Error fetching owned tickets:', err);
      setError('Gagal memuat tiket Anda. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTicket = async (ownedTicketID) => {
    try {
      setRedeemLoading(ownedTicketID);
      
      // Call API to update ticket status
      const response = await ownedTicketAPI.useTicket(ownedTicketID);
      
      if (response && response.data) {
        // Update local state with the response data
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.ownedTicketID === ownedTicketID 
            ? { ...ticket, usageStatus: 'Sudah Digunakan' }
            : ticket
        )
      );
      
      alert('Tiket berhasil digunakan!');
        
        // After 3 seconds, sort tickets to move used ones to bottom
        setTimeout(() => {
          setTickets(prevTickets => {
            const activeTickets = prevTickets.filter(ticket => ticket.usageStatus === 'Belum Digunakan');
            const expiredTickets = prevTickets.filter(ticket => ticket.usageStatus === 'Kadaluarsa');
            const usedTickets = prevTickets.filter(ticket => ticket.usageStatus === 'Sudah Digunakan');
            return [...activeTickets, ...expiredTickets, ...usedTickets];
          });
        }, 3000);
      }
      
    } catch (err) {
      console.error('Error using ticket:', err);
      
      let errorMessage = 'Gagal menggunakan tiket. Silakan coba lagi.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = 'Tiket tidak ditemukan atau tidak dapat digunakan.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Tiket sudah pernah digunakan sebelumnya.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Anda tidak memiliki akses untuk menggunakan tiket ini.';
      }
      
      alert(errorMessage);
    } finally {
      setRedeemLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const isTicketValid = (ownedTicket) => {
    const validDate = ownedTicket.Transaction?.validDate || ownedTicket.validDate;
    if (!validDate) return false;
    
    const today = new Date();
    const ticketDate = new Date(validDate);
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);
    
    // Tiket hanya valid pada tanggal yang sama atau setelahnya
    return ticketDate.getTime() === today.getTime();
  };

  const isTicketExpired = (ownedTicket) => {
    const validDate = ownedTicket.Transaction?.validDate || ownedTicket.validDate;
    if (!validDate) return false;
    
    const today = new Date();
    const ticketDate = new Date(validDate);
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);
    
    // Ticket expires if the valid date has passed
    return today.getTime() > ticketDate.getTime();
  };

  const processTicketExpiration = (tickets) => {
    return tickets.map(ticket => {
      if (ticket.usageStatus === 'Belum Digunakan' && isTicketExpired(ticket)) {
        return { ...ticket, usageStatus: 'Kadaluarsa' };
      }
      return ticket;
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat tiket Anda..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOwnedTickets} />;
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Breadcrumb Navigation */}
      <div className="border-t border-gray-100" style={{ background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="flex items-center" style={{ height: '60px' }}>
            <div style={{ marginLeft: '100px' }}>
              <h2 className="text-lg font-semibold text-secondary" style={{ marginBottom: '0px', fontSize: '18px', fontWeight: 'bold' }}>Koleksi Tiket</h2>
              <p className="text-gray text-sm" style={{ marginBottom: '0px' }}>Lihat dan kelola semua tiket yang Anda miliki</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6" style={{ paddingLeft: '120px', paddingRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          {/* Active Tickets Counter */}
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#d4a464' }}>
                {tickets.filter(ticket => ticket.usageStatus === 'Belum Digunakan').length}
              </div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Tiket Active</div>
            </div>
          </div>
          
          {/* Expired Tickets Counter */}
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#6c757d' }}>
                {tickets.filter(ticket => ticket.usageStatus === 'Kadaluarsa').length}
              </div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Tiket Expired</div>
        </div>
      </div>

          {/* Used Tickets Counter */}
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold" style={{ color: '#6c757d' }}>
                {tickets.filter(ticket => ticket.usageStatus === 'Sudah Digunakan').length}
              </div>
              <div className="text-sm font-bold" style={{ color: '#6c757d' }}>Tiket Used</div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {tickets.map((ownedTicket) => (
              <div 
                key={`${ownedTicket.ownedTicketID}-${ownedTicket.usageStatus}-${Date.now()}`}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px 16px 4px 4px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '280px'
                }}
              >
                {/* Border using repeating-linear-gradient */}
                <div 
                  key={`border-${ownedTicket.ownedTicketID}-${ownedTicket.usageStatus}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      repeating-linear-gradient(0deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px) 0 0 / 2px 100%,
                      repeating-linear-gradient(90deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px) 0 0 / 100% 2px,
                      repeating-linear-gradient(0deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px) 100% 0 / 2px 100%,
                      repeating-linear-gradient(90deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px) 0 100% / 100% 2px
                    `,
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '16px 16px 4px 4px',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 85% 40%, 85% 60%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, 15% 60%, 15% 40%, 0% 40%)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />

                {/* Decorative Holes on Sides */}
                <div 
                  key={`hole-left-${ownedTicket.ownedTicketID}-${ownedTicket.usageStatus}`}
                  style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '25.33334px',
                    height: '65.33334px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '50%',
                    border: `3px solid ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'}`,
                    zIndex: 2
                  }}
                />
                <div 
                  key={`hole-right-${ownedTicket.ownedTicketID}-${ownedTicket.usageStatus}`}
                  style={{
                    position: 'absolute',
                    right: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '25.33334px',
                    height: '65.33334px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '50%',
                    border: `3px solid ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'}`,
                    zIndex: 2
                  }}
                />

                {/* Ticket Header Strip */}
                <div 
                  style={{
                    background: ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa'
                      ? 'linear-gradient(90deg, #6c757d 0%, #5a6268 100%)' 
                      : 'linear-gradient(90deg, #d4a464 0%, #b8956b 100%)',
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
                    <div className="text-white text-sm opacity-90">
                      {ownedTicket.Transaction?.validDate ? formatDate(ownedTicket.Transaction.validDate) : 
                       ownedTicket.validDate ? formatDate(ownedTicket.validDate) : 'Tanggal tidak tersedia'} - {ownedTicket.uniqueCode}
                    </div>
                  </div>
                </div>

                {/* Perforated Line Effect */}
                <div 
                  style={{
                    height: '2px',
                    background: `repeating-linear-gradient(90deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px)`,
                    margin: '0 -2px'
                  }}
                />
                
                {/* Ticket Content */}
                <div className="p-3" style={{ paddingTop: '12px' }}>
                  {/* Temple Name - Main Title */}
                  <div className="text-center mb-2">
                    <div 
                      className="text-lg font-bold px-6 py-2 rounded-full inline-block mb-1"
                      style={{ 
                        backgroundColor: ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464', 
                        color: 'white',
                        marginTop: '10px'
                      }}
                    >
                      {ownedTicket.Ticket?.Temple?.title || 'Candi Bersejarah'}
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
                      {ownedTicket.Ticket?.description || 'Deskripsi tidak tersedia'}
                    </p>
                  </div>

                  {/* Price - Big and Prominent */}
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold text-green-600">
                      {ownedTicket.Ticket?.price ? formatPrice(ownedTicket.Ticket.price) : 'Harga tidak tersedia'}
                    </div>
                  </div>

                  {/* Ticket Stub - Bottom Section */}
                  <div 
                    className="pt-3 mt-3"
                    style={{ 
                      borderTop: '2px solid transparent',
                      backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 8px, ${ownedTicket.usageStatus === 'Sudah Digunakan' || ownedTicket.usageStatus === 'Kadaluarsa' ? '#6c757d' : '#d4a464'} 16px)`,
                      backgroundSize: '100% 2px',
                      backgroundPosition: 'left top',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ paddingTop: '11px' }}>
                      <div className="text-xs" style={{ color: '#6c757d' }}>
                        <div>STATUS USAGE</div>
                        <div className="font-semibold" style={{ color: '#243e3e' }}>
                          {ownedTicket.usageStatus === 'Sudah Digunakan' ? 'USED' 
                           : ownedTicket.usageStatus === 'Kadaluarsa' ? 'EXPIRED'
                           : 'ACTIVE'}
                  </div>
                </div>

                      {/* Action Button */}
                      <div className="flex items-center">
                        {ownedTicket.usageStatus === 'Belum Digunakan' ? (
                    <button
                      onClick={() => handleUseTicket(ownedTicket.ownedTicketID)}
                            disabled={redeemLoading === ownedTicket.ownedTicketID || !isTicketValid(ownedTicket)}
                            className="px-4 py-2 rounded-lg text-white font-bold text-sm border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                            style={{ 
                              backgroundColor: redeemLoading === ownedTicket.ownedTicketID || !isTicketValid(ownedTicket) ? '#9ca3af' : '#d4a464', 
                              border: 'none',
                              boxShadow: redeemLoading === ownedTicket.ownedTicketID || !isTicketValid(ownedTicket) ? '0 2px 4px rgba(156, 163, 175, 0.3)' : '0 2px 4px rgba(212, 164, 100, 0.3)',
                              cursor: redeemLoading === ownedTicket.ownedTicketID || !isTicketValid(ownedTicket) ? 'not-allowed' : 'pointer',
                              opacity: redeemLoading === ownedTicket.ownedTicketID || !isTicketValid(ownedTicket) ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!e.target.disabled) {
                                e.target.style.backgroundColor = '#c19653';
                                e.target.style.boxShadow = '0 4px 12px rgba(212, 164, 100, 0.5)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.target.disabled) {
                                e.target.style.backgroundColor = '#d4a464';
                                e.target.style.boxShadow = '0 2px 4px rgba(212, 164, 100, 0.3)';
                              }
                            }}
                            title={!isTicketValid(ownedTicket) ? 'Tiket hanya bisa digunakan pada tanggal yang valid' : ''}
                    >
                      {redeemLoading === ownedTicket.ownedTicketID ? (
                        <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Proses...</span>
                        </>
                            ) : !isTicketValid(ownedTicket) ? (
                              'Belum Valid'
                      ) : (
                              'Gunakan'
                      )}
                    </button>
                        ) : ownedTicket.usageStatus === 'Kadaluarsa' ? (
                          <div className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ backgroundColor: '#6c757d' }}>
                            Kadaluarsa
                          </div>
                        ) : (
                          <div className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ backgroundColor: '#6c757d' }}>
                            Terpakai
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">Belum Ada Tiket</h3>
            <p className="text-gray mb-6">
              Anda belum memiliki tiket. Beli tiket untuk mulai menjelajahi candi-candi bersejarah.
            </p>
            <button
              onClick={() => navigate('/tickets')}
              className="btn btn-primary"
            >
              Beli Tiket Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage; 