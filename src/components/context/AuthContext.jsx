// context/AuthContext.jsx - VERSION CORRIGÉE
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

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
              console.log("👤 Utilisateur restauré:", parsedUser);
            } catch (parseError) {
              console.error("❌ Erreur parsing user:", parseError);
              localStorage.removeItem("user"); // Nettoyer les données corrompues
            }
          }
        }
      } catch (error) {
        console.error("❌ Erreur initialisation auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔑 Tentative de login...");
      
      const response = await api.post(
        `/groupe-8/auth/login`,
        { email, password }
      );

      const { token, user: userData } = response.data;
      
      console.log("✅ Login réussi, données:", { 
        tokenPresent: !!token, 
        userData 
      });
      
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
        console.log("📝 Utilisateur minimal créé:", minimalUser);
      }
      
      // Configurer axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Mettre à jour l'état
      const finalUser = userData || { email, role: 'user' };
      setUser(finalUser);
      
      console.log("🏁 Login terminé, user défini:", finalUser);
      
      return { success: true, user: finalUser };
      
    } catch (error) {
      console.error("❌ Erreur login complète:", {
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
        console.error("Erreur parsing pour admin check:", e);
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