// services/api.js - CORRECTION
import axios from 'axios';

const BASE_URL = 'https://api.react.nos-apps.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Intercepteur request - CORRIGÉ
api.interceptors.request.use(
  (config) => {
    // Vérifiez LES DEUX noms possibles
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token ajouté:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Aucun token trouvé dans localStorage');
      // Debug: affichez ce qui est stocké
      console.log('Contenu localStorage:', {
        authToken: localStorage.getItem('authToken'),
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName')
      });
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur response
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 Session expirée, déconnexion...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    
    console.error('❌ Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;