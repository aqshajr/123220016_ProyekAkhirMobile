import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy untuk API ML
      '/api/ml': {
        target: 'https://artefacto-749281711221.asia-southeast2.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ml/, ''),
        secure: true,
        // Pastikan data form multipart diteruskan dengan benar
        onProxyReq: (proxyReq, req, res) => {
          // Jangan ubah badan permintaan untuk data multipart
          console.log('Proxying ML request:', req.method, req.url);
          console.log('Content-Type:', req.headers['content-type']);
          
          // Pertahankan header asli untuk data form multipart
          if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            console.log('Detected multipart form data, preserving headers');
          }
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
  },
})
