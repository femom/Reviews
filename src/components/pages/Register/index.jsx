import React, { useState } from 'react';
import Topsejour from "../../../assets/images/Topsejour.png";
import api from '../../services/api';
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { logger } from "../../../utils/logger.js";

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('user'); // Nouveau state pour le rôle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupeId = 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!email.includes('@')) {
      setError("Veuillez entrer un email valide");
      return;
    }

    // Validation du rôle
    if (!['user', 'admin'].includes(role)) {
      setError("Rôle invalide");
      return;
    }

    setLoading(true);

    try {
      logger.info("Register attempt");
      
      const response = await api.post(
        `/groupe-${groupeId}/auth/register`,
        {
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
          role // Ajout du rôle dans les données envoyées
        }
      );

      logger.info("Register success");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      
    } catch (err) {
      logger.error("Register error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      const errors = err.response?.data?.errors;

      if (errors) {
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join("\n"));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError("Erreur réseau. Vérifiez votre connexion ou les problèmes CORS.");
      } else {
        setError("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src={Topsejour} alt="Logo" className="h-24 w-24 object-contain" />
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">Créer un compte</h2>
            <p className="text-sm text-ink-600">Rejoignez la communauté Reviews.</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
            {error.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
            <FiUser className="text-ink-500" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet"
              required
              disabled={loading}
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
            <FiMail className="text-ink-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={loading}
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
            <FiLock className="text-ink-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe (8 caractères min)"
              required
              minLength="8"
              disabled={loading}
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2">
            <FiLock className="text-ink-500" />
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirmer le mot de passe"
              required
              minLength="8"
              disabled={loading}
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
            />
          </div>

          <button
            className="w-full rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
            type="submit"
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-ink-600">
          <p>Déjà un compte ? <a href="/login" className="font-semibold text-ink-800">Se connecter</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
