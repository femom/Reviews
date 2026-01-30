import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Topsejour from "../../../assets/images/Topsejour.png";
import imgBg from "../../../assets/images/img3.jpeg";
import api from "../../services/api";
import { HiMail, HiLockClosed, HiArrowRight, HiHome } from "react-icons/hi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginDirect = async (emailVal, passwordVal) => {
    try {
      const response = await api.post("/groupe-8/auth/login", { email: emailVal, password: passwordVal });
      const token = response.data.access_token || response.data.token;
      const userData = response.data.user || response.data;
      if (token && userData) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userData.id || userData.user_id);
        localStorage.setItem("userName", userData.name || userData.username || "");
        localStorage.setItem("userData", JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, error: "Structure de réponse invalide" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Erreur de connexion",
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
        navigate("/", { replace: true });
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:block w-full md:w-1/2 min-h-[40vh] md:min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imgBg})` }}
      />
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-8 md:p-10 animate-[slide-up_0.5s_ease-out]">
            <div className="flex justify-center mb-8">
              <img src={Topsejour} alt="Logo" className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white text-center mb-2">
              Se connecter
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
              Accédez à votre espace en toute sécurité
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="ex: herika@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Entrer le mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none transition-all duration-200"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Connexion
                    <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 space-y-3 text-center text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                Pas de compte ?{" "}
                <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                  S&apos;inscrire
                </Link>
              </p>
              <p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <HiHome className="w-4 h-4" />
                  Retour à l&apos;accueil
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
