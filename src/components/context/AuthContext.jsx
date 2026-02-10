// context/AuthContext.jsx - VERSION CORRIGÉE
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { logger } from "../../utils/logger.js";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Récupérer l'utilisateur du localStorage
          if (userStr && userStr !== "undefined" && userStr !== "null") {
            try {
              const parsedUser = JSON.parse(userStr);
              setUser(parsedUser);
              logger.info("User restored");
            } catch (parseError) {
              logger.error("User parse error:", parseError);
              localStorage.removeItem("user"); // Nettoyer les données corrompues
            }
          }
        }
      } catch (error) {
        logger.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      logger.info("Auth login attempt");
      
      const response = await api.post(
        `/groupe-8/auth/login`,
        { email, password }
      );

      const { token, user: userData } = response.data;
      
      logger.info("Auth login success");
      
      // ⚠️ IMPORTANT: Stocker TOUT dans localStorage
      localStorage.setItem("token", token);
      
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Créer un objet utilisateur minimal si l'API n'envoie pas de userData
        const minimalUser = { 
          email, 
          role: 'user',
          id: response.data.id || Date.now()
        };
        localStorage.setItem("user", JSON.stringify(minimalUser));
        logger.info("Minimal user created");
      }
      
      // Configurer axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Mettre à jour l'état
      const finalUser = userData || { email, role: 'user' };
      setUser(finalUser);
      
      logger.info("Auth login completed");
      
      return { success: true, user: finalUser };
      
    } catch (error) {
      logger.error("Auth login error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorMessage = "Email ou mot de passe incorrect";
      
      if (error.response?.status === 404) {
        errorMessage = "Endpoint de login introuvable";
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    // Nettoyer TOUT
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    // Redirection
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  // Fonction pour vérifier si l'utilisateur est admin
  const isAdmin = () => {
    if (!user) return false;
    
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try {
        const storedUser = JSON.parse(userStr);
        return storedUser.role === 'admin' || 
               storedUser.isAdmin === true || 
               storedUser.is_admin === true;
      } catch (e) {
        logger.error("Admin check parse error:", e);
        return false;
      }
    }
    
    return user.role === 'admin' || 
           user.isAdmin === true || 
           user.is_admin === true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: () => !!localStorage.getItem("authToken"),
    isAdmin: isAdmin() // Ajoutez cette fonction
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
