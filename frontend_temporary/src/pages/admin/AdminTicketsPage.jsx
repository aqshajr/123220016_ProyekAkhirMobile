import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Plus, Edit, Trash2, DollarSign, Search, LogOut, MapPin, Camera, Settings, ChevronDown } from 'lucide-react';
import { ticketAPI, templeAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
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
      
      // Fetch tickets and temples simultaneously
      const [ticketsResponse, templesResponse] = await Promise.all([
        ticketAPI.getAllTickets(),
        templeAPI.getAllTemples()
      ]);
      
      if (ticketsResponse && ticketsResponse.data && ticketsResponse.data.tickets) {
        setTickets(ticketsResponse.data.tickets);
      } else {
        setTickets([]);
      }

      if (templesResponse && templesResponse.data && templesResponse.data.temples) {
        setTemples(templesResponse.data.temples);
      } else {
        setTemples([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId, ticketDescription) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tiket "${ticketDescription}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeleteLoading(ticketId);
      await ticketAPI.deleteTicket(ticketId);
      
      // Refresh data setelah delete
      await fetchData();
      
      alert('Tiket berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Gagal menghapus tiket. Silakan coba lagi.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateTicket = () => {
    navigate('/admin/tickets/create');
  };

  const handleEditTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}/edit`);
  };

  const getTempleName = (templeId) => {
    const temple = temples.find(t => t.templeID === templeId);
    return temple ? temple.title : 'Unknown Temple';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Filter tickets by selected temple and search query
  const filteredTickets = tickets.filter(ticket => {
    const templeMatch = !selectedTemple || ticket.templeID === parseInt(selectedTemple);
    const searchMatch = !searchQuery || 
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTempleName(ticket.templeID).toLowerCase().includes(searchQuery.toLowerCase());
    
    return templeMatch && searchMatch;
  });

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data tiket..." />;
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
                Kelola data tiket dan harga
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
      <div className="py-6" style={{ paddingLeft: '120px', paddingRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary">{tickets.length}</div>
              <div className="text-sm text-gray font-bold">Total Tiket</div>
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
                placeholder="Cari tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-6 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                style={{ width: '70vw', maxWidth: '342px', paddingLeft: '40px' }}
              />
            </div>
            
            <button
              onClick={handleCreateTicket}
              className="btn btn-primary flex items-center space-x-2 py-3"
            >
              <Plus size={18} />
              <span className="font-bold">Tambah Tiket</span>
            </button>
          </div>
        </div>

        {(selectedTemple || searchQuery) && (
          <div className="text-sm text-gray mb-6">
            Menampilkan {filteredTickets.length} dari {tickets.length} tiket
          </div>
        )}

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {filteredTickets.map((ticket) => (
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
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />

                {/* Decorative Holes on Sides */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '25.33334px',
                    height: '65.33334px',
                    backgroundColor: '#E0DFDB',
                    borderRadius: '50%',
                    border: '3px solid #d4a464',
                    zIndex: 2
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
                    backgroundColor: '#E0DFDB',
                    borderRadius: '50%',
                    border: '3px solid #d4a464',
                    zIndex: 2
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
                    <div className="text-white text-sm opacity-90">
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
                      style={{ 
                        backgroundColor: '#d4a464', 
                        color: 'white',
                        marginTop: '10px'
                      }}
                    >
                      {getTempleName(ticket.templeID)}
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
                        <div>STOK TERSEDIA</div>
                        <div className="font-semibold" style={{ color: '#243e3e' }}>
                          {ticket.stock} TIKET
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTicket(ticket.ticketID);
                          }}
                          className="px-3 py-2 rounded-lg text-white font-bold text-sm border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{ 
                            backgroundColor: '#d4a464',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(212, 164, 100, 0.3)'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTicket(ticket.ticketID, ticket.description);
                          }}
                          disabled={deleteLoading === ticket.ticketID}
                          className="px-3 py-2 rounded-lg text-white font-bold text-sm border-0 transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{ 
                            backgroundColor: '#ef4444',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          {deleteLoading === ticket.ticketID ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
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
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {searchQuery || selectedTemple ? 'Tidak Ada Tiket yang Cocok' : 'Belum Ada Data Tiket'}
            </h3>
            <p className="text-gray">
              {searchQuery || selectedTemple
                ? 'Coba ubah filter pencarian'
                : 'Tiket akan muncul di sini setelah Anda menambahkannya.'
              }
            </p>
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

export default AdminTicketsPage; 