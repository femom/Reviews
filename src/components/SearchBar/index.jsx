// components/SearchBar/index.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiX, FiClock } from "react-icons/fi";

const SearchBar = ({ onSearch, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer les recherches récentes du localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Réinitialiser la recherche quand on change de page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [location]);

  // Focus sur l'input sur mobile quand le menu s'ouvre
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sauvegarder une recherche récente
  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query,
      ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, 5); // Garder seulement les 5 dernières
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Gérer la soumission de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    
    const query = searchQuery.trim();
    if (!query) return;

    // Sauvegarder la recherche
    saveToRecentSearches(query);

    // Naviguer vers la page des établissements avec le paramètre de recherche
    navigate(`/etablissements?search=${encodeURIComponent(query)}`);

    // Réduire la barre sur mobile
    if (isMobile) {
      setIsExpanded(false);
    }

    // Fermer les suggestions
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
    setSearchQuery('');
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Si on est sur la page des établissements, retirer le filtre
    if (location.pathname === '/etablissements') {
      navigate('/etablissements');
    }
  };

  // Gérer le clic en dehors pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions basées sur la recherche
  const getSuggestions = () => {
    if (!searchQuery.trim()) {
      return recentSearches;
    }
    
    // Vous pouvez remplacer par des suggestions d'API réelles
    const mockSuggestions = [
      'Hotel Paris',
      'Restaurant Italien',
      'Spa Luxury',
      'Bar Cocktail',
      'Café Terrace'
    ];
    
    return mockSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
      <div className={`relative ${className}`}>
      {/* Bouton de recherche (mobile seulement) */}
      {isMobile && !isExpanded && (
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 text-ink-700 transition hover:bg-white/50"
          onClick={() => setIsExpanded(true)}
          aria-label="Ouvrir la recherche"
        >
          <FiSearch />
        </button>
      )}

      {/* Formulaire de recherche */}
      {(isExpanded || !isMobile) && (
        <form 
          className="glass-soft relative flex w-full max-w-sm items-center gap-2 rounded-2xl px-3 py-2" 
          onSubmit={handleSearch}
          role="search"
        >
          <div className="flex w-full items-center gap-2" ref={searchInputRef}>
            <input
              type="text"
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
              placeholder="Rechercher un établissement..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              aria-label="Rechercher un établissement"
            />
            
            {/* Bouton d'effacement */}
            {searchQuery && (
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/40 text-ink-600 hover:bg-white/60"
                onClick={handleClearSearch}
                aria-label="Effacer la recherche"
              >
                <FiX />
              </button>
            )}
            
            {/* Bouton de recherche */}
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-600/90 text-white hover:bg-ink-700"
              aria-label="Lancer la recherche"
            >
              <FiSearch />
            </button>
          </div>

          {/* Suggestions de recherche */}
          {showSuggestions && (searchQuery || recentSearches.length > 0) && (
            <div className="glass-panel absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl text-sm">
              {searchQuery && (
                <div
                  className="flex cursor-pointer items-center gap-2 px-4 py-3 text-ink-800 hover:bg-white/40"
                  onClick={() => handleSuggestionClick(searchQuery)}
                >
                  <FiSearch className="text-ink-500" />
                  <span>Rechercher "{searchQuery}"</span>
                </div>
              )}
              
              {getSuggestions().map((suggestion, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center gap-2 px-4 py-3 text-ink-800 hover:bg-white/40"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <FiClock className="text-ink-500" />
                  <span>{suggestion}</span>
                </div>
              ))}
              
              {recentSearches.length > 0 && (
                <div className="border-t border-white/30 px-4 py-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-ink-600 hover:text-ink-800"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('recentSearches');
                    }}
                  >
                    Effacer l'historique
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      )}

      {/* Bouton de fermeture (mobile seulement) */}
      {isMobile && isExpanded && (
        <button
          className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 text-ink-700 hover:bg-white/50"
          onClick={() => {
            setIsExpanded(false);
            setShowSuggestions(false);
          }}
          aria-label="Fermer la recherche"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
