import React, { useState, useEffect } from "react";
import Topsejour from "../../assets/images/Topsejour.png";
import SearchBar from "../SearchBar/index.jsx";
import Button from "../Button/index.jsx";
import { Link, useNavigate } from "react-router-dom";
import { HiHome, HiOfficeBuilding, HiHeart, HiPlusCircle, HiLogin, HiLogout, HiUser, HiMenu, HiX } from "react-icons/hi";

function NavBar() {
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkAuth();
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsAuth(false);
    setUserName("");
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] h-16 md:h-[72px] flex items-center justify-between px-4 md:px-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-sm transition-all duration-300 safe-top">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" onClick={closeMenu} className="flex-shrink-0">
            <img src={Topsejour} alt="Logo TopSéjour" className="h-10 md:h-14 w-auto transition-transform duration-300 hover:scale-105" />
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Menu"
            className="md:hidden flex flex-col justify-center gap-1.5 w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center transition-transform duration-300"
          >
            {menuOpen ? (
              <HiX className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <>
                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-200 rounded" />
                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-200 rounded" />
                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-200 rounded" />
              </>
            )}
          </button>
        </div>

        {menuOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] animate-[fade-in_0.2s_ease-out]"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        <div
          className={`fixed md:static top-16 left-0 right-0 bottom-0 md:flex md:flex-1 md:items-center md:justify-between md:gap-4 md:ml-6 bg-white/95 dark:bg-gray-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-r md:border-r-0 border-gray-200/50 dark:border-gray-700/50 md:border-0 flex flex-col p-6 md:p-0 overflow-y-auto z-[999] transition-transform duration-300 ease-out ${
            menuOpen && isMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex-1 md:flex md:items-center md:gap-4 w-full md:max-w-xl">
            <div className="w-full mb-6 md:mb-0 md:flex-1 md:max-w-md">
              <SearchBar onSearch={closeMenu} />
            </div>

            {isMobile && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                {isAuth ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {userName || "Connecté"}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Déconnecté
                  </span>
                )}
              </div>
            )}

            <ul className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 list-none p-0 m-0">
              <li>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <HiHome className="w-5 h-5 md:w-4 md:h-4" />
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/etablissements"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <HiOfficeBuilding className="w-5 h-5 md:w-4 md:h-4" />
                  <span>Établissements</span>
                </Link>
              </li>
              {isAuth && (
                <>
                  <li>
                    <Link
                      to="/favorites"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <HiHeart className="w-5 h-5 md:w-4 md:h-4" />
                      <span>Favoris</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/addetabs"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <HiPlusCircle className="w-5 h-5 md:w-4 md:h-4" />
                      <span>Ajouter</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-6 md:mt-0 md:ml-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {!isAuth ? (
              <Link to="/login" onClick={closeMenu} className="w-full md:w-auto">
                <Button contenu="Connexion" color="bleu" className="w-full md:w-auto" />
              </Link>
            ) : (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {!isMobile && userName && (
                  <span className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 text-sm">
                    <HiUser className="w-4 h-4" />
                    Bonjour, {userName}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                  className="flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <HiLogout className="w-5 h-5 md:w-4 md:h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
