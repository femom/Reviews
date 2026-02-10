// services/api.js - CORRECTION
import axios from 'axios';
import { logger } from "../../utils/logger.js";

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
      logger.info("Auth token attached");
    } else {
      logger.warn("No auth token found");
    }
    
    logger.info(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    logger.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Intercepteur response
api.interceptors.response.use(
  (response) => {
    logger.info(`${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      logger.warn("Session expired, logging out");
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    
    logger.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
