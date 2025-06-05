// Import StrictMode dari React untuk mendeteksi masalah potensial dalam aplikasi
import { StrictMode } from 'react'
// Import createRoot untuk merender aplikasi React dengan cara modern (React 18+)
import { createRoot } from 'react-dom/client'
// Import file CSS utama untuk styling global
import './index.css'
// Import komponen App yang merupakan komponen utama aplikasi
import App from './App.jsx'

// Membuat root aplikasi dan merender komponen App
// getElementById('root') mengambil element div dengan id="root" dari file index.html
createRoot(document.getElementById('root')).render(
  // StrictMode membantu mendeteksi masalah dalam development
  <StrictMode>
    {/* Komponen App adalah komponen utama yang berisi seluruh aplikasi */}
    <App />
  </StrictMode>,
)
