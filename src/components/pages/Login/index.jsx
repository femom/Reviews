// Login.jsx - VERSION CORRIGÉE
import React, { useState } from 'react';
import Topsejour from "../../../assets/images/Topsejour.png";
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction de connexion directe (sans AuthContext pour debug)
  const handleLoginDirect = async (email, password) => {
    try {
      console.log("🔐 Tentative connexion directe...");
      
      const response = await api.post('/groupe-8/auth/login', {
        email,
        password
      });

      console.log("✅ Réponse API login:", response.data);
      
      // VÉRIFIEZ LA STRUCTURE DE LA RÉPONSE
      const token = response.data.access_token || response.data.token;
      const userData = response.data.user || response.data;
      
      console.log("Token extrait:", token ? token.substring(0, 20) + '...' : 'NON TROUVÉ');
      console.log("UserData:", userData);
      
      if (token && userData) {
        // STOCKAGE COMPLET ET COHÉRENT
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userData.id || userData.user_id);
        localStorage.setItem('userName', userData.name || userData.username || '');
        
        // Vérifiez le stockage
        console.log("📦 Après stockage:");
        console.log("- authToken:", localStorage.getItem('authToken') ? "✓" : "✗");
        console.log("- userId:", localStorage.getItem('userId'));
        console.log("- userName:", localStorage.getItem('userName'));
        
        return { success: true, user: userData };
      } else {
        console.error("❌ Données manquantes dans la réponse");
        return { success: false, error: "Structure de réponse invalide" };
      }
    } catch (error) {
      console.error("❌ Erreur connexion:", error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Erreur de connexion" 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await handleLoginDirect(email, password);
      
      if (result.success) {
        console.log("🎉 Connexion réussie, redirection...");
        navigate("/", { replace: true });
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // ... reste du code JSX ...


  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src={Topsejour} alt="Logo" className="h-24 w-24 object-contain" />
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">Se connecter</h2>
            <p className="text-sm text-ink-600">Accédez à vos établissements favoris.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Email</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
              <FiMail className="text-ink-500" />
              <input
                type="email"
                className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                placeholder="ex: herika@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Mot de passe</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
              <FiLock className="text-ink-500" />
              <input
                type="password"
                className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                placeholder="Entrer le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
            type="submit"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Connexion"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-xs text-ink-600">
          <p>
            Pas de compte ? <Link to="/register" className="font-semibold text-ink-800">S'inscrire</Link>
          </p>
          <p>
            <Link to="/" className="font-semibold text-ink-800">Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
