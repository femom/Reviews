import React, { useState, useEffect } from "react";
import Topsejour from "../../assets/images/Topsejour.png";
import SearchBar from "../SearchBar/index.jsx";
import Button from "../Button/index.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";

function NavBar() {
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Vérifier l'authentification et la taille d'écran
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");
      
      setIsAuth(!!token);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || "");
        } catch (e) {
          console.error("Erreur parsing userData:", e);
        }
      }
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkAuth();
    checkScreenSize();

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);

    // Écouteurs d'événements
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    // Supprimer TOUS les items liés à l'auth
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsAuth(false);
    setUserName("");
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const triggerWave = () => {
    const wave = document.createElement("div");
    wave.className = "theme-wave";
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 1300);
  };

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
    triggerWave();
  };

  return (
    <nav className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-4">
      <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-3 py-1.5 animate-fadeUp">
        <div className="flex items-center gap-3">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
            <img
              src={Topsejour}
              alt="Logo TopSéjour"
              className="h-14 w-14 origin-left scale-[1.4] object-contain"
            />
          </Link>
        </div>

        <div className="hidden flex-1 items-center gap-8 md:flex md:justify-center">
          <SearchBar onSearch={closeMenu} className="w-full max-w-xs" />
          <div className="flex items-center gap-5 text-sm font-semibold text-ink-700 dark:text-white/80">
            <Link
              to="/"
              className="nav-link-underline rounded-full px-3 py-1 text-ink-700 transition hover:text-ink-900 dark:text-white/80 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
            >
              Accueil
            </Link>
            <Link
              to="/etablissements"
              className="nav-link-underline rounded-full px-3 py-1 text-ink-700 transition hover:text-ink-900 dark:text-white/80 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
            >
              Établissements
            </Link>
            {isAuth && (
              <>
                <Link
                  to="/favorites"
                  className="nav-link-underline rounded-full px-3 py-1 text-ink-700 transition hover:text-ink-900 dark:text-white/80 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
                >
                  Favoris
                </Link>
                <Link
                  to="/addetabs"
                  className="nav-link-underline rounded-full px-3 py-1 text-ink-700 transition hover:text-ink-900 dark:text-white/80 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
                >
                  Ajouter
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isMobile && !isAuth && (
            <Link to="/login">
              <Button contenu="Connexion" />
            </Link>
          )}
          {!isMobile && isAuth && (
            <button
              className="rounded-full bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              Déconnexion
            </button>
          )}
          <button
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/30 text-ink-700 transition hover:bg-white/50"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            title="Changer de thème"
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 text-ink-700 transition hover:bg-white/50"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" onClick={closeMenu} />
      )}

      <div
        className={`fixed right-4 top-20 z-50 w-[min(90vw,320px)] transition ${
          menuOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
        }`}
      >
        <div className="glass-panel rounded-2xl p-4">
          <div className="mb-4 md:hidden">
            <SearchBar onSearch={closeMenu} />
          </div>

          <button
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/40 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-white/60 md:hidden"
            onClick={toggleTheme}
            aria-label="Changer de thème"
          >
            {isDark ? <FiSun /> : <FiMoon />}
            {isDark ? "Thème clair" : "Thème sombre"}
          </button>

          {isMobile && (
            <div className="mb-4 flex items-center gap-2 text-sm text-ink-700">
              {isAuth ? (
                <>
                  <FiCheckCircle className="text-emerald-500" />
                  <span>{userName || "Connecté"}</span>
                </>
              ) : (
                <>
                  <FiAlertCircle className="text-rose-500" />
                  <span>Déconnecté</span>
                </>
              )}
            </div>
          )}

          <ul className="space-y-2 text-sm font-medium text-ink-800">
            <li>
              <Link to="/" onClick={closeMenu} className="block rounded-xl px-3 py-2 hover:bg-white/40">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/etablissements" onClick={closeMenu} className="block rounded-xl px-3 py-2 hover:bg-white/40">
                Établissements
              </Link>
            </li>
            {isAuth && (
              <>
                <li>
                  <Link to="/favorites" onClick={closeMenu} className="block rounded-xl px-3 py-2 hover:bg-white/40">
                    Favoris
                  </Link>
                </li>
                <li>
                  <Link to="/addetabs" onClick={closeMenu} className="block rounded-xl px-3 py-2 hover:bg-white/40">
                    Ajouter
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="mt-4 border-t border-white/30 pt-4">
            {!isAuth ? (
              <Link to="/login" onClick={closeMenu} className="block">
                <Button contenu="Connexion" className="w-full" />
              </Link>
            ) : (
              <div className="space-y-3">
                {!isMobile && userName && (
                  <span className="block text-sm text-ink-700">Bonjour, {userName}</span>
                )}
                <button
                  className="w-full rounded-full bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isMobile && (
        <div className="sr-only">
          {/* desktop-only actions are already in the main bar */}
        </div>
      )}
    </nav>
  );
}

export default NavBar;
