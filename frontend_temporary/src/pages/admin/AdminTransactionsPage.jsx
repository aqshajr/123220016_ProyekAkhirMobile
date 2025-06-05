import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Calendar, LogOut, MapPin, Camera, Settings, Ticket } from 'lucide-react';
import { transactionAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching admin transactions...');
      const response = await transactionAPI.getAllTransactionsAdmin();
      
      console.log('Admin transactions response:', response);
      console.log('Response data:', response?.data);
      console.log('Transactions array:', response?.data?.transactions);
      
      if (response && response.data && response.data.transactions) {
        console.log('Setting transactions:', response.data.transactions);
        setTransactions(response.data.transactions);
      } else {
        console.log('No transactions found in response');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      console.error('Error details:', err.response?.data);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);
    
    return dateMatch;
  });

  // Calculate statistics
  const totalRevenue = transactions.reduce((sum, transaction) => {
    const price = parseFloat(transaction.totalPrice) || 0;
    console.log(`Transaction ${transaction.transactionID}: totalPrice="${transaction.totalPrice}", parsed=${price}`);
    return sum + price;
  }, 0);
  
  console.log('Total transactions:', transactions.length);
  console.log('Total revenue calculated:', totalRevenue);
  
  // Calculate this month's revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  console.log('This month transactions:', thisMonthTransactions.length);
  
  const thisMonthRevenue = thisMonthTransactions
    .reduce((sum, transaction) => {
      const price = parseFloat(transaction.totalPrice) || 0;
      return sum + price;
    }, 0);
  
  console.log('This month revenue calculated:', thisMonthRevenue);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat data transaksi..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTransactions} />;
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
                Kelola data transaksi dan pendapatan
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

      {/* Stats */}
      <div className="py-6" style={{ paddingLeft: '20px', paddingRight: '20px', marginLeft: '120px', marginRight: '120px' }}>
        <div className="flex items-center justify-between mb-6">
          {/* Left: Stats Cards */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-primary">{transactions.length}</div>
                <div className="text-sm text-gray font-bold">Total Transaksi</div>
              </div>
            </div>
            <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-primary">{formatPrice(totalRevenue)}</div>
                <div className="text-sm text-gray font-bold">Total Pendapatan</div>
              </div>
            </div>
            <div className="bg-white rounded-xl px-6 shadow-sm flex items-center" style={{ height: '44px' }}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-primary">{formatPrice(thisMonthRevenue)}</div>
                <div className="text-sm text-gray font-bold">Pendapatan Bulan Ini</div>
              </div>
            </div>
          </div>

          {/* Right: Date Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tanggal Mulai"
                style={{ height: '44px' }}
              />
              <span className="text-gray">-</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tanggal Akhir"
                style={{ height: '44px' }}
              />
            </div>
            
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-sm text-gray hover:text-secondary transition-colors"
                style={{ height: '44px' }}
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
        
        {(startDate || endDate) && (
          <div className="text-sm text-gray mb-6">
            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.transactionID} 
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                style={{ minHeight: '255px' }}
              >
                {/* Transaction Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard size={18} className="text-white" />
                      <h3 className="font-semibold text-white text-lg">
                        Transaksi #{transaction.transactionID}
                      </h3>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      transaction.status === 'success' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status === 'success' ? 'Berhasil' : 
                       transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                    </div>
                  </div>
                  <div className="text-sm text-white/90 mt-1">
                    {formatDate(transaction.transactionDate)}
                  </div>
                </div>

                {/* Transaction Content */}
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    {/* Pembeli */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Pembeli:</span>
                      <div className="font-semibold text-secondary text-right">
                        {transaction.User ? transaction.User.username : (transaction.userID ? `User ID: ${transaction.userID}` : 'User Terhapus')}
                      </div>
                    </div>
                    
                    {/* Tiket Info */}
                    <div className="flex items-start justify-between">
                      <span className="text-gray-500 font-medium">Tiket:</span>
                      <div className="text-right flex-1 ml-2">
                        <div className="font-semibold text-secondary">
                          {transaction.Ticket?.Temple?.title || 'Candi'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.ticketQuantity} tiket • {transaction.Ticket?.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Price */}
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Total Pembayaran:</span>
                        <div className="font-bold text-green-600 text-xl">
                          {formatPrice(parseFloat(transaction.totalPrice) || 0)}
                        </div>
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
              <CreditCard size={40} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {startDate || endDate ? 'Tidak Ada Transaksi yang Cocok' : 'Belum Ada Data Transaksi'}
            </h3>
            <p className="text-gray">
              {startDate || endDate
                ? 'Coba ubah filter tanggal'
                : 'Transaksi akan muncul di sini ketika pengguna mulai membeli tiket.'
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

export default AdminTransactionsPage; 