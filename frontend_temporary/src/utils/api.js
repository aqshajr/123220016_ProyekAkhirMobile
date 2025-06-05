import axios from 'axios';
import Cookies from 'js-cookie';

// Konfigurasi URL dasar dari variabel lingkungan
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://artefacto-backend-749281711221.us-central1.run.app/api';

// URL API ML - gunakan proxy dalam pengembangan, URL langsung dalam produksi
const isDevelopment = import.meta.env.DEV;
const ML_API_URL = isDevelopment 
  ? '/api/ml'  // Gunakan proxy Vite dalam pengembangan
  : (import.meta.env.VITE_ML_API_URL || 'https://artefacto-749281711221.asia-southeast2.run.app');

// Membuat instance axios untuk API backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Nonaktifkan kredensial untuk CORS
});

// Membuat instance axios untuk API ML
const mlApiClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 30000,
});

// Interceptor untuk menambahkan token ke setiap permintaan
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani respons dan kesalahan
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika ada respons dari server
    if (error.response) {
      if (error.response.status === 401) {
        // Token kedaluwarsa atau tidak valid, hapus token dan arahkan ke login
        Cookies.remove('authToken');
        Cookies.remove('userRole');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Permintaan dibuat tapi tidak ada respons (server tidak tersedia)
      console.log('Server tidak tersedia:', error.request);
    } else {
      // Kesalahan lain dalam pengaturan permintaan
      console.log('Error:', error.message);
    }
    return Promise.reject(error);
  }
);


// Fungsi utilitas untuk autentikasi
export const authAPI = {
  // Masuk pengguna
  login: async (email, password) => {
    console.log('API Login request:', { email, password });
    
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('API Login response:', response);
    console.log('Login response data:', response.data);
    
    // Simpan token dan role ke cookies jika login berhasil
    if (response.data.data && response.data.data.token) {
      // Struktur baru: response.data.data.token
      Cookies.set('authToken', response.data.data.token, { expires: 7 });
      if (response.data.data.user && response.data.data.user.role !== undefined) {
        let role = response.data.data.user.role;
        // Ubah boolean role menjadi string integer (true = "1", false = "0")
        if (typeof role === 'boolean') {
          role = role ? 1 : 0;
        }
        Cookies.set('userRole', role.toString(), { expires: 7 });
      }
    } else if (response.data.token) {
      // Struktur lama: response.data.token
      Cookies.set('authToken', response.data.token, { expires: 7 });
      if (response.data.user && response.data.user.role !== undefined) {
        let role = response.data.user.role;
        // Ubah peran boolean menjadi string integer (true = "1", false = "0")
        if (typeof role === 'boolean') {
          role = role ? 1 : 0;
        }
        Cookies.set('userRole', role.toString(), { expires: 7 });
      }
    }
    
    return response.data;
  },

  // Daftar pengguna baru
  register: async (username, email, password, passwordConfirmation) => {
    const requestData = {
      username,
      email,
      password,
      passwordConfirmation: passwordConfirmation, // Server mengharapkan camelCase
    };
    
    console.log('API Register request:', requestData);
    
    const response = await apiClient.post('/auth/register', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Raw API response:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Simpan token dan peran ke cookies jika pendaftaran berhasil
    if (response.data.data && response.data.data.token) {
      Cookies.set('authToken', response.data.data.token, { expires: 7 });
      // Peran akan disimpan di AuthContext karena mungkin tidak ada di respons
    }
    
    return response.data;
  },

  // Perbarui profil pengguna
  updateProfile: async (formData) => {
    const response = await apiClient.put('/auth/profile', formData, {
      headers: {
        // Hapus Content-Type secara eksplisit agar browser mengatur multipart/form-data dengan boundary
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  // Hapus akun pengguna
  deleteAccount: async () => {
    const response = await apiClient.delete('/auth/profile');
    
    // Hapus token dan peran dari cookies setelah hapus akun
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    
    return response.data;
  },

  // Keluar pengguna
  logout: () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    window.location.href = '/login';
  },

  // Periksa apakah pengguna sudah login
  isAuthenticated: () => {
    return !!Cookies.get('authToken');
  },

  // Dapatkan role pengguna
  getUserRole: () => {
    return Cookies.get('userRole') || '0';
  },

  // Periksa apakah pengguna adalah admin
  isAdmin: () => {
    return Cookies.get('userRole') === '1';
  },
};

// Fungsi API untuk tiket
export const ticketAPI = {
  // Dapatkan semua tiket
  getAllTickets: async () => {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  // Dapatkan detail tiket berdasarkan ID
  getTicketById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // Buat tiket baru (Admin only)
  createTicket: async (ticketData) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  // Update tiket (Admin only)
  updateTicket: async (id, ticketData) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Hapus tiket (Admin only)
  deleteTicket: async (id) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },
};

// Fungsi API untuk tiket yang dimiliki pengguna
export const ownedTicketAPI = {
  // Dapatkan semua tiket yang dimiliki pengguna
  getOwnedTickets: async () => {
    const response = await apiClient.get('/owned-tickets');
    return response.data;
  },

  // Dapatkan detail tiket yang dimiliki berdasarkan ID
  getOwnedTicketById: async (id) => {
    const response = await apiClient.get(`/owned-tickets/${id}`);
    return response.data;
  },

  // Gunakan tiket (mark as used)
  useTicket: async (id) => {
    const response = await apiClient.put(`/owned-tickets/${id}/use`);
    return response.data;
  },
};

// Fungsi API untuk transaksi
export const transactionAPI = {
  // Dapatkan semua transaksi
  getAllTransactions: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },

  // Dapatkan semua transaksi untuk admin (semua pengguna)
  getAllTransactionsAdmin: async () => {
    const response = await apiClient.get('/transactions/admin/all');
    return response.data;
  },

  // Dapatkan detail transaksi berdasarkan ID
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // Buat transaksi baru (pembelian tiket)
  createTransaction: async (transactionData) => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  },
};

// Fungsi API untuk candi
export const templeAPI = {
  // Dapatkan semua candi
  getAllTemples: async () => {
    const response = await apiClient.get('/temples');
    return response.data;
  },

  // Dapatkan detail candi berdasarkan ID
  getTempleById: async (id) => {
    const response = await apiClient.get(`/temples/${id}`);
    return response.data;
  },

  // Buat candi baru (Admin only)
  createTemple: async (formData) => {
    console.log('=== Debug API createTemple ===');
    console.log('FormData diterima di API:', formData);
    console.log('Konstruktor FormData:', formData.constructor.name);
    
    // Catat isi FormData
    if (formData instanceof FormData) {
      console.log('Entri FormData:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }
    }
    
    console.log('Membuat permintaan POST ke /temples...');
    const response = await apiClient.post('/temples', formData, {
      headers: {
        // Hapus Content-Type secara eksplisit agar browser mengatur multipart/form-data dengan boundary
        'Content-Type': undefined,
      },
    });
    console.log('=== Akhir Debug API createTemple ===');
    return response.data;
  },

  // Update candi (Admin only)
  updateTemple: async (id, formData) => {
    const response = await apiClient.put(`/temples/${id}`, formData, {
      headers: {
        // Hapus Content-Type secara eksplisit agar browser mengatur multipart/form-data dengan boundary
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  // Hapus candi (Khusus Admin)
  deleteTemple: async (id) => {
    const response = await apiClient.delete(`/temples/${id}`);
    return response.data;
  },
};

// Fungsi API untuk artefak
export const artifactAPI = {
  // Dapatkan semua artefak
  getAllArtifacts: async () => {
    const response = await apiClient.get('/artifacts');
    return response.data;
  },

  // Dapatkan detail artefak berdasarkan ID
  getArtifactById: async (id) => {
    const response = await apiClient.get(`/artifacts/${id}`);
    return response.data;
  },

  // Buat artefak baru (Admin only)
  createArtifact: async (formData) => {
    const response = await apiClient.post('/artifacts', formData, {
      headers: {
        // Hapus Content-Type secara eksplisit agar browser mengatur multipart/form-data dengan boundary
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  // Update artefak (Admin only)
  updateArtifact: async (id, formData) => {
    const response = await apiClient.put(`/artifacts/${id}`, formData, {
      headers: {
        // Hapus Content-Type secara eksplisit agar browser mengatur multipart/form-data dengan boundary
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  // Hapus artefak (Admin only)
  deleteArtifact: async (id) => {
    const response = await apiClient.delete(`/artifacts/${id}`);
    return response.data;
  },

  // Bookmark artefak
  bookmarkArtifact: async (id) => {
    const response = await apiClient.post(`/artifacts/${id}/bookmark`);
    return response.data;
  },

  // Tandai artefak sebagai sudah dibaca
  markAsRead: async (id) => {
    const response = await apiClient.post(`/artifacts/${id}/read`);
    return response.data;
  },
};

// Fungsi API untuk Machine Learning (prediksi artefak)
export const mlAPI = {
  // Prediksi artefak dari gambar
  predictArtifact: async (formData) => {
    try {
      const originalFile = formData.get('image');
      
      if (!originalFile) {
        throw new Error('Tidak ada file yang disediakan');
      }
      
      // Buat FormData baru dengan nama field yang benar untuk API ML
      const mlFormData = new FormData();
      mlFormData.append('file', originalFile);  // API ML mengharapkan nama field 'file'
      
      const response = await mlApiClient.post('/predict', mlFormData, {
        timeout: 60000, // Tingkatkan timeout untuk pemrosesan ML
      });
      
      return response;
    } catch (error) {
      console.error('Kesalahan API ML:', error.message);
      throw error;
    }
  }
};

// Ekspor default untuk kemudahan impor
export default {
  auth: authAPI,
  tickets: ticketAPI,
  ownedTickets: ownedTicketAPI,
  transactions: transactionAPI,
  temples: templeAPI,
  artifacts: artifactAPI,
  ml: mlAPI,
}; 