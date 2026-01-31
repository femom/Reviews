import React, { useState, useEffect } from "react";
import Topsejour from "../../assets/images/Topsejour.png";
import SearchBar from "../SearchBar/index.jsx";
import Button from "../Button/index.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiOfficeBuilding,
  HiHeart,
  HiPlusCircle,
  HiLogin,
  HiLogout,
  HiUser,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  fadeIn,
  overlayVariant,
  slideInLeft,
} from "../../utils/motionVariants";
function NavBar() {
  // États existants conservés
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // nouveau: état pour transition au scroll
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

    // scroll handler pour ajouter une légère variation (opacity/shadow) au scroll
    const onScroll = () => setScrolled(window.scrollY > 8);

    checkAuth();
    checkScreenSize();
    onScroll();

    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("storage", checkAuth);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", onScroll);
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

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  // Réutilisables Tailwind classes pour cohérence
  const NAV_HEIGHT = "h-16 md:h-[72px]";
  const baseLink =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2";
  const linkText = "text-slate-700 dark:text-slate-200";
  const iconClass = "w-5 h-5 text-slate-700 dark:text-slate-200";

  return (
    <>
      {/* Nav principal: glassmorphism + subtle gradient + transition on scroll */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-[1000] ${NAV_HEIGHT} flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-lg bg-gradient-to-r from-indigo-600/20 via-violet-500/12 to-emerald-400/10 border-b border-white/10 shadow-2xl"
            : "backdrop-blur-md bg-gradient-to-r from-indigo-500/10 via-violet-400/10 to-emerald-400/10 border-b border-white/5 shadow-sm"
        }`}
      >
        {/* Left: logo + mobile menu button */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex-shrink-0 flex items-center gap-3"
          >
            <img
              src={Topsejour}
              alt="TopSéjour"
              className="h-9 md:h-12 w-auto transition-transform duration-300 hover:scale-105"
            />
            <span className="sr-only">Accueil</span>
          </Link>

          {/* Mobile Menu Toggle - accessible */}
          <Motion.button
            type="button"
            onClick={toggleMenu}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="navbar-menu"
            whileTap={{ scale: 0.95 }}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-black/40 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            title="Menu"
          >
            {menuOpen ? (
              <HiX className="w-6 h-6 text-slate-800 dark:text-white" />
            ) : (
              <HiMenu className="w-6 h-6 text-slate-800 dark:text-white" />
            )}
          </Motion.button>
        </div>

        {/* Center: Search bar (collapses nicely on mobile) */}
        <div className="flex-1 hidden md:flex items-center justify-center md:justify-start md:ml-6">
          <div className="w-full max-w-xl">
            <SearchBar onSearch={closeMenu} />
          </div>
        </div>

        {/* Right: Links + actions */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          <ul className="flex items-center gap-2 md:gap-3 list-none m-0 p-0">
            <li>
              <Link
                to="/"
                onClick={closeMenu}
                className={`${baseLink} ${linkText} hover:bg-white/10`}
              >
                <HiHome className={iconClass} aria-hidden="true" />
                <span className="hidden md:inline">Accueil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/etablissements"
                onClick={closeMenu}
                className={`${baseLink} ${linkText} hover:bg-white/10`}
              >
                <HiOfficeBuilding className={iconClass} aria-hidden="true" />
                <span className="hidden md:inline">Établissements</span>
              </Link>
            </li>
            {isAuth && (
              <>
                <li>
                  <Link
                    to="/favorites"
                    onClick={closeMenu}
                    className={`${baseLink} ${linkText} hover:bg-white/10`}
                  >
                    <HiHeart className={iconClass} aria-hidden="true" />
                    <span className="hidden md:inline">Favoris</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/addetabs"
                    onClick={closeMenu}
                    className={`${baseLink} ${linkText} hover:bg-white/10`}
                  >
                    <HiPlusCircle className={iconClass} aria-hidden="true" />
                    <span className="hidden md:inline">Ajouter</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth actions */}
          {!isAuth ? (
            <Link
              to="/login"
              onClick={closeMenu}
              className="inline-flex items-center"
            >
              <Button
                contenu="Connexion"
                color="bleu"
                className="px-4 py-2 rounded-lg"
              />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {!isMobile && userName && (
                <span className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg">
                  <HiUser className="w-4 h-4" />
                  <span className="hidden md:inline">Bonjour, {userName}</span>
                </span>
              )}
              <Motion.button
                type="button"
                onClick={handleLogout}
                whileTap={{ scale: 0.98 }}
                aria-label="Se déconnecter"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              >
                <HiLogout className="w-5 h-5" />
                <span className="hidden md:inline">Déconnexion</span>
              </Motion.button>
            </div>
          )}
        </div>

        {/* Mobile Menu: overlay + panel (animated using shared variants) */}
        <AnimatePresence>
          {menuOpen && isMobile && (
            <Motion.div
              key="navbar-overlay"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[998]"
              aria-hidden={menuOpen ? "false" : "true"}
              onClick={closeMenu}
            >
              <Motion.div
                key="overlay"
                variants={overlayVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.22 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />

              <Motion.div
                id="navbar-menu"
                role="menu"
                variants={slideInLeft}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-16 w-full max-w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-white/10 dark:border-slate-800 p-4 flex flex-col gap-3"
              >
                {/* Search compact */}
                <div className="w-full">
                  <SearchBar
                    onSearch={() => {
                      closeMenu();
                    }}
                  />
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/30 dark:bg-slate-800/40">
                  {isAuth ? (
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {userName || "Connecté"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Déconnecté
                    </span>
                  )}
                </div>

                {/* Links vertical */}
                <nav aria-label="Mobile navigation">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link
                        to="/"
                        onClick={() => {
                          closeMenu();
                        }}
                        className={`${baseLink} ${linkText} hover:bg-white/10 w-full`}
                      >
                        <HiHome className={iconClass} />
                        Accueil
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/etablissements"
                        onClick={() => {
                          closeMenu();
                        }}
                        className={`${baseLink} ${linkText} hover:bg-white/10 w-full`}
                      >
                        <HiOfficeBuilding className={iconClass} />
                        Établissements
                      </Link>
                    </li>
                    {isAuth && (
                      <>
                        <li>
                          <Link
                            to="/favorites"
                            onClick={() => {
                              closeMenu();
                            }}
                            className={`${baseLink} ${linkText} hover:bg-white/10 w-full`}
                          >
                            <HiHeart className={iconClass} />
                            Favoris
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/addetabs"
                            onClick={() => {
                              closeMenu();
                            }}
                            className={`${baseLink} ${linkText} hover:bg-white/10 w-full`}
                          >
                            <HiPlusCircle className={iconClass} />
                            Ajouter
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>

                  {/* Actions */}
                  <div className="mt-3">
                    {!isAuth ? (
                      <Link
                        to="/login"
                        onClick={() => {
                          closeMenu();
                        }}
                        className="w-full block"
                      >
                        <Button
                          contenu="Connexion"
                          color="bleu"
                          className="w-full"
                        />
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Motion.button
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            handleLogout();
                            closeMenu();
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium shadow-md"
                        >
                          <HiLogout className="w-5 h-5" />
                          Déconnexion
                        </Motion.button>
                      </div>
                    )}
                  </div>
                </nav>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer pour éviter que le contenu soit caché par le nav */}
      <div className="h-16 md:h-[72px]" aria-hidden="true" />
    </>
  );
}

export default NavBar;
