// vite.config.js - CONFIGURATION CORRECTE
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.react.nos-apps.com',
        changeOrigin: true,
        secure: false,
        // ⚠️ IMPORTANT: Configuration spécifique pour éviter les problèmes
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🌐 Proxy:', req.method, req.url, '→', proxyReq.path);
          });
        }
      }
    }
  }
})