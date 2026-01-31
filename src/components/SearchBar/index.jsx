// components/SearchBar/index.jsx
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { HiSearch, HiX } from "react-icons/hi";
import { fadeInUp } from "../../utils/motionVariants";
import { IoTimeOutline } from "react-icons/io5";

const SearchBar = ({ onSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768,
  );
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer les recherches récentes du localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location]);

  useEffect(() => {
    if (isExpanded && searchInputRef.current) searchInputRef.current.focus();
  }, [isExpanded]);

  useEffect(() => {
    const handler = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Sauvegarder une recherche récente
  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 5); // Garder seulement les 5 dernières

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Gérer la soumission de la recherche
  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    // Sauvegarder la recherche
    saveToRecentSearches(query);

    navigate(`/etablissements?search=${encodeURIComponent(query)}`);
    if (isMobileView) setIsExpanded(false);
    setShowSuggestions(false);

    // Appeler le callback parent si fourni
    if (onSearch) {
      onSearch(query);
    }
  };

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    // Naviguer directement
    navigate(`/etablissements?search=${encodeURIComponent(suggestion)}`);
    saveToRecentSearches(suggestion);

    if (onSearch) {
      onSearch(suggestion);
    }
  };

  // Effacer la recherche
  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Si on est sur la page des établissements, retirer le filtre
    if (location.pathname === "/etablissements") {
      navigate("/etablissements");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-bar-wrapper"))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockSuggestions = [
    "Hotel Paris",
    "Restaurant Italien",
    "Spa Luxury",
    "Bar Cocktail",
    "Café Terrace",
  ];
  const getSuggestions = () => {
    if (!searchQuery.trim()) return recentSearches;
    return mockSuggestions.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const showForm = isExpanded || !isMobileView;

  const suggestionsList = {
    initial: {},
    animate: { transition: { staggerChildren: 0.04 } },
    exit: {},
  };

  const suggestionItem = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
  };

  return (
    <div
      className={`search-bar-wrapper relative w-full ${className} ${isExpanded && isMobileView ? "fixed inset-0 z-[1002] flex items-center p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" : ""}`}
    >
      {isMobileView && !isExpanded && (
        <Motion.button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label="Ouvrir la recherche"
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <HiSearch className="w-5 h-5" />
        </Motion.button>
      )}

      {showForm && (
        <form onSubmit={handleSearch} role="search" className="relative w-full">
          <div className="relative flex items-center rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200 overflow-hidden">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher un établissement..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              aria-label="Rechercher un établissement"
              className="flex-1 w-full min-w-0 py-2.5 pl-4 pr-2 text-gray-900 dark:text-gray-100 bg-transparent text-base placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Effacer"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Rechercher"
              className="flex items-center justify-center w-10 h-10 mx-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
            >
              <HiSearch className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence>
            {showSuggestions && (searchQuery || recentSearches.length > 0) && (
              <Motion.div
                variants={suggestionsList}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-10 max-h-[280px] overflow-y-auto"
              >
                {searchQuery && (
                  <Motion.button
                    variants={suggestionItem}
                    type="button"
                    onClick={() => handleSuggestionClick(searchQuery)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <HiSearch className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-800 dark:text-gray-200">
                      Rechercher &quot;{searchQuery}&quot;
                    </span>
                  </Motion.button>
                )}
                {getSuggestions().map((suggestion, index) => (
                  <Motion.button
                    variants={suggestionItem}
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <IoTimeOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-800 dark:text-gray-200">
                      {suggestion}
                    </span>
                  </Motion.button>
                ))}
                {recentSearches.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("recentSearches");
                      }}
                      className="text-sm text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      Effacer l&apos;historique
                    </button>
                  </div>
                )}
              </Motion.div>
            )}
          </AnimatePresence>
        </form>
      )}

      {isMobileView && isExpanded && (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setShowSuggestions(false);
          }}
          aria-label="Fermer"
          className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <HiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
