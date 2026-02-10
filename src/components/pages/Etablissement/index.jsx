import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiHeart, FiMapPin, FiStar, FiEdit, FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { logger } from "../../../utils/logger.js";

function Etablissement({ title }) {
  // --- ÉTATS ---
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverImages, setCoverImages] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [etabsWithImages, setEtabsWithImages] = useState([]);

  // États pour la modale de modification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEtab, setCurrentEtab] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    nom: "", 
    type: "", 
    adresse: "", 
    description: "",
    note: ""
  });

  const { user, token, role, favorites, setFavorites } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromUrl = queryParams.get("type");
  const searchQuery = queryParams.get("search") || "";

  // --- LOGIQUE ADMIN SIMPLIFIÉE ---
  // Vérifie si l'utilisateur est admin via plusieurs méthodes
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Méthode 1: Vérifier le localStorage directement
    const userName = localStorage.getItem('userName');
    const isAdminFromLocalStorage = userName === 'Admin Groupe8';
    
    // Méthode 2: Vérifier via le contexte Auth
    const isAdminFromContext = role === "admin" || user?.role === "admin";
    
    // Méthode 3: Vérifier via le nom d'utilisateur dans le contexte
    const isAdminFromUserName = user?.name === 'Admin Groupe8' || user?.username === 'Admin Groupe8';
    
    // Combiner toutes les méthodes
    const adminStatus = isAdminFromLocalStorage || isAdminFromContext || isAdminFromUserName;
    
    logger.info("Admin status resolved");
    
    setIsAdmin(adminStatus);
    
    // Log pour debug
    if (adminStatus) {
      logger.info("User identified as admin");
    } else {
      logger.info("User not admin");
    }
  }, [user, role]);

  // --- DONNÉES DE SECOURS ---
  const fallbackEtablissements = [
    {
      id: 1,
      nom: "Le Gourmet Parisien",
      type: "Restaurant",
      description: "Cuisine française raffinée dans un cadre élégant. Spécialités de poisson et de viande avec des produits locaux.",
      adresse: "15 Rue de la Paix, 75002 Paris",
      note: 4.5,
      moyenne: 4.5
    },
    {
      id: 2,
      nom: "Pasta e Vino",
      type: "Restaurant Italien",
      description: "Authentique cuisine italienne avec pâtes fraîches faites maison. Vaste sélection de vins italiens.",
      adresse: "22 Rue des Lombards, 75004 Paris",
      note: 4.2,
      moyenne: 4.2
    },
    {
      id: 3,
      nom: "Sushi Zen",
      type: "Restaurant Japonais",
      description: "Sushi et sashimi préparés par un chef japonais expérimenté. Ambiance zen et apaisante.",
      adresse: "8 Rue Sainte-Anne, 75001 Paris",
      note: 4.7,
      moyenne: 4.7
    },
    {
      id: 4,
      nom: "Le Bistrot Moderne",
      type: "Bistrot",
      description: "Bistrot traditionnel avec une touche moderne. Plats généreux et ambiance chaleureuse.",
      adresse: "45 Rue du Faubourg Saint-Honoré, 75008 Paris",
      note: 4.0,
      moyenne: 4.0
    },
    {
      id: 5,
      nom: "Coffee & Co",
      type: "Café",
      description: "Café artisanal et pâtisseries maison. Lieu idéal pour travailler ou se détendre.",
      adresse: "12 Boulevard Saint-Germain, 75005 Paris",
      note: 4.3,
      moyenne: 4.3
    },
    {
      id: 6,
      nom: "Burger Factory",
      type: "Fast-Food",
      description: "Burgers gourmets avec ingrédients de qualité. Options végétariennes disponibles.",
      adresse: "30 Rue de Rivoli, 75004 Paris",
      note: 4.1,
      moyenne: 4.1
    },
    {
      id: 7,
      nom: "La Table du Marché",
      type: "Restaurant",
      description: "Cuisine du marché avec produits frais et de saison. Menu changeant quotidiennement.",
      adresse: "18 Rue Montorgueil, 75001 Paris",
      note: 4.4,
      moyenne: 4.4
    },
    {
      id: 8,
      nom: "Le Petit Bouchon",
      type: "Bistrot",
      description: "Cuisine lyonnaise traditionnelle dans une ambiance conviviale. Spécialités de charcuterie.",
      adresse: "5 Rue des Rosiers, 75004 Paris",
      note: 4.6,
      moyenne: 4.6
    }
  ];

  const etabImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop"
  ];

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        logger.info("Fetching establishments");
        const res = await api.get("/groupe-8/etablissements");
        
        if (isMounted) {
          logger.info("Establishments response received");
          
          let data;
          if (res.data && Array.isArray(res.data)) {
            data = res.data;
          } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          } else if (res.data && res.data.etablissements && Array.isArray(res.data.etablissements)) {
            data = res.data.etablissements;
          } else {
            logger.warn("Unexpected data structure");
            data = [];
          }
          
          if (!Array.isArray(data)) {
            logger.warn("API data not array");
            data = [];
          }
          
          const processEtabs = async () => {
            const processedEtabs = [];
            
            for (const etab of data) {
              try {
                const processedEtab = {
                  id: etab.id || etab._id || Math.random().toString(36).substr(2, 9),
                  nom: etab.nom || etab.name || "Établissement sans nom",
                  type: etab.type || etab.categorie || "Non spécifié",
                  description: etab.description || etab.desc || "Aucune description disponible.",
                  adresse: etab.adresse || etab.address || etab.location || "",
                  note: etab.note || etab.moyenne || etab.rating || etab.avis || 3.5,
                  moyenne: etab.moyenne || etab.rating || etab.note || 3.5
                };
                
                processedEtabs.push(processedEtab);
              } catch (error) {
                logger.error("Processing establishment error:", error);
              }
            }
            
            return processedEtabs;
          };
          
          const processedData = await processEtabs();
          setEtablissements(processedData);
          setEtabsWithImages(processedData);
        }
      } catch (err) {
        logger.error("Fetch establishments error:", err);
        
        if (isMounted) {
          setError(`L'API n'est pas disponible (${err.message}). Affichage des données de démonstration.`);
          
          const etabsWithImages = fallbackEtablissements.map((etab, index) => ({
            ...etab,
            image: etabImages[index % etabImages.length]
          }));
          
          setEtablissements(fallbackEtablissements);
          setEtabsWithImages(etabsWithImages);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // --- 2. CHARGEMENT DES IMAGES DE COUVERTURE (optimisé) ---
  useEffect(() => {
    let alive = true;
    
    const fetchEtabImage = async (etabId) => {
      try {
        const response = await api.get(`/groupe-8/etablissements/${etabId}/images`);
        logger.info("Image API response received");
        
        if (response.data && response.data.length > 0) {
          const firstImage = response.data[0];
          return firstImage.url || firstImage.imageUrl || firstImage.path;
        }
      } catch (error) {
        logger.warn("Image load failed:", error.message);
      }
      
      const randomIndex = Math.floor(Math.random() * etabImages.length);
      return etabImages[randomIndex];
    };

    const fetchCovers = async () => {
      if (!etablissements.length) return;
      
      const updatedEtabs = [...etabsWithImages];
      const newCoverImages = { ...coverImages };
      let needsUpdate = false;
      
      for (let i = 0; i < etablissements.length; i++) {
        const etab = etablissements[i];
        if (!etab || !etab.id || newCoverImages[etab.id]) continue;
        
        try {
          const imageUrl = await fetchEtabImage(etab.id);
          newCoverImages[etab.id] = imageUrl;
          
          // Mettre à jour etabsWithImages
          const index = updatedEtabs.findIndex(e => e.id === etab.id);
          if (index !== -1) {
            updatedEtabs[index] = { ...updatedEtabs[index], image: imageUrl };
          }
          needsUpdate = true;
        } catch (err) {
          logger.error("Image error:", err);
          newCoverImages[etab.id] = etabImages[i % etabImages.length];
        }
      }
      
      if (alive && needsUpdate) {
        setCoverImages(newCoverImages);
        setEtabsWithImages(updatedEtabs);
      }
    };
    
    fetchCovers();
    return () => { alive = false; };
  }, [etablissements]);

  // --- 3. FILTRAGE (Optimisé avec useMemo) ---
  const filtered = useMemo(() => {
    return etabsWithImages.filter((e) => {
      if (!e) return false;
      
      const matchesType = typeFromUrl 
        ? e.type?.toLowerCase().trim() === typeFromUrl.toLowerCase().trim() 
        : true;
      
      const matchesSearch = searchQuery 
        ? e.nom?.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;
      
      return matchesType && matchesSearch;
    });
  }, [etabsWithImages, typeFromUrl, searchQuery]);

  // --- 4. GESTION DES FAVORIS ---
  const toggleFavorite = useCallback((etabId) => {
    if (!etabId) return;
    
    const currentFavorites = favorites || [];
    const isFavorite = currentFavorites.includes(etabId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = currentFavorites.filter(id => id !== etabId);
    } else {
      newFavorites = [...currentFavorites, etabId];
    }
    
    if (setFavorites) {
      setFavorites(newFavorites);
    }
    
    const favBtn = document.querySelector(`.fav-btn-overlay[data-id="${etabId}"]`);
    if (favBtn) {
      favBtn.classList.add('pulse');
      setTimeout(() => favBtn.classList.remove('pulse'), 300);
    }
    
    return !isFavorite;
  }, [favorites, setFavorites]);

  // --- 5. ACTIONS ADMIN (Supprimer) ---
  const handleDelete = async (id) => {
    if (!id) {
      alert("ID invalide");
      return;
    }
    
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.")) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      if (etablissements === fallbackEtablissements) {
        setEtablissements(prev => prev.filter(item => item.id !== id));
        setEtabsWithImages(prev => prev.filter(item => item.id !== id));
        alert("Établissement supprimé (mode démo).");
        setDeletingId(null);
        return;
      }

      // Utiliser le token du localStorage directement
      const authToken = token || localStorage.getItem('authToken');
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      try {
        await api.delete(`/groupe-8/images/${id}`, { headers });
        logger.info("Images deleted for establishment");
      } catch (imgError) {
        logger.warn("Unable to delete images:", imgError.message);
      }
      
      await api.delete(`/groupe-8/admin/etablissements/${id}`, { headers });
      
      setEtablissements(prev => prev.filter(item => item.id !== id));
      setEtabsWithImages(prev => prev.filter(item => item.id !== id));
      
      alert("Établissement supprimé avec succès.");
    } catch (err) {
      logger.error("Delete error:", err);
      
      const errorMessage = err.response?.data?.message || err.message;
      const status = err.response?.status;
      
      let userMessage = "Erreur lors de la suppression.";
      
      if (status === 403) {
        userMessage = "Erreur 403 : Accès refusé. Vous n'avez pas les permissions nécessaires.";
      } else if (status === 401) {
        userMessage = "Erreur 401 : Non authentifié. Veuillez vous reconnecter.";
      } else if (status === 404) {
        userMessage = "Erreur 404 : Établissement non trouvé.";
      }
      
      alert(`${userMessage} Détails: ${errorMessage}`);
      
      const etabsWithImages = fallbackEtablissements.map((etab, index) => ({
        ...etab,
        image: etabImages[index % etabImages.length]
      }));
      setEtablissements(fallbackEtablissements);
      setEtabsWithImages(etabsWithImages);
    } finally {
      setDeletingId(null);
    }
  };

  // --- 6. ACTIONS ADMIN (Modifier) ---
  const openEditModal = (etab) => {
    if (!etab) return;
    setCurrentEtab({ ...etab });
    setEditFormData({
      nom: etab.nom || "",
      type: etab.type || "",
      adresse: etab.adresse || "",
      description: etab.description || "",
      note: etab.note || etab.moyenne || ""
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentEtab || !currentEtab.id) {
      alert("Établissement invalide");
      return;
    }
    
    setUpdatingId(currentEtab.id);
    
    try {
      if (etablissements === fallbackEtablissements) {
        setEtablissements(prev => prev.map(item => 
          item.id === currentEtab.id ? { ...item, ...editFormData } : item
        ));
        setEtabsWithImages(prev => prev.map(item => 
          item.id === currentEtab.id ? { ...item, ...editFormData, image: item.image } : item
        ));
        setIsModalOpen(false);
        alert("✨ Mise à jour réussie (mode démo) !");
        setUpdatingId(null);
        return;
      }

      // Utiliser le token du localStorage directement
      const authToken = token || localStorage.getItem('authToken');
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const updateData = {
        nom: editFormData.nom,
        type: editFormData.type,
        description: editFormData.description,
        adresse: editFormData.adresse,
        note: editFormData.note || 3.5
      };
      
      await api.put(`/groupe-8/admin/etablissements/${currentEtab.id}`, updateData, { headers });
      
      setEtablissements(prev => prev.map(item => 
        item.id === currentEtab.id ? { ...item, ...editFormData } : item
      ));
      setEtabsWithImages(prev => prev.map(item => 
        item.id === currentEtab.id ? { ...item, ...editFormData } : item
      ));
      
      setIsModalOpen(false);
      alert("✨ Mise à jour réussie !");
    } catch (err) {
      logger.error("Update error:", err);
      
      const errorMessage = err.response?.data?.message || err.message;
      const status = err.response?.status;
      
      let userMessage = "Erreur lors de la mise à jour.";
      
      if (status === 403) {
        userMessage = "Erreur 403 : Accès refusé. Vous n'avez pas les permissions nécessaires.";
      } else if (status === 401) {
        userMessage = "Erreur 401 : Non authentifié. Veuillez vous reconnecter.";
      }
      
      alert(`${userMessage} Détails: ${errorMessage}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- RENDU ---
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36" data-reveal>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Catalogue</p>
        <h2 className="text-3xl font-semibold text-ink-900 md:text-4xl">
          {typeFromUrl
            ? `${typeFromUrl.charAt(0).toUpperCase() + typeFromUrl.slice(1)}s`
            : title || "Tous les établissements"}
        </h2>
      </div>

      {error && etablissements === fallbackEtablissements && (
        <div className="glass-panel mb-6 flex items-center gap-2 rounded-2xl px-5 py-4 text-sm text-rose-600 dark:text-rose-200">
          <FiAlertTriangle />
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-6 py-5 text-ink-700 dark:text-white/80">
          <div className="h-3 w-3 animate-pulse rounded-full bg-ink-500" />
          <p>Chargement des établissements...</p>
        </div>
      ) : (
        <>
          {!filtered || filtered.length === 0 ? (
            <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center text-ink-900 dark:text-white">
              <p className="text-sm text-ink-600 dark:text-white/80">Aucun établissement trouvé.</p>
              <button
                onClick={() => navigate("/")}
                className="rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
              >
                Voir tous les établissements
              </button>
            </div>
          ) : (
            <div data-reveal-section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {filtered.map((etab, index) => {
                if (!etab) return null;

                const isFavorite = Array.isArray(favorites) && favorites.includes(etab.id);
                const currentRating = etab.note || etab.moyenne || etab.rating || 3.5;
                const imageUrl = coverImages[etab.id] || etab.image || etabImages[0];

                return (
                  <div
                    data-reveal
                    data-reveal-delay={`${Math.min(400, index * 60)}ms`}
                    className={`group relative overflow-hidden rounded-3xl bg-white/20 shadow-glass transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(79,70,229,0.25)] h-full ${
                      index % 2 === 0 ? "reveal-fade-left" : "reveal-fade-right"
                    }`}
                    key={etab.id || `etab-${Math.random()}`}
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-800">
                      <FiStar className="text-amber-500" />
                      {typeof currentRating === "number" ? currentRating.toFixed(1) : "3.5"}
                    </div>

                    <button
                      className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800 shadow"
                      data-id={etab.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(etab.id);
                      }}
                      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavorite ? <FaHeart className="text-rose-500" /> : <FiHeart className="text-ink-500" />}
                      <span className="hidden sm:inline">
                        {isFavorite ? "Favori" : "Ajouter"}
                      </span>
                    </button>

                    <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/45 px-4 py-3 text-white backdrop-blur-xl dark:bg-slate-900/60">
                      <Link to={`/details/${etab.id}`} className="block">
                        <h3 className="text-sm font-semibold">{etab.nom || "Nom inconnu"}</h3>
                        <p className="text-xs text-white/70">{etab.type || "Non spécifié"}</p>
                        {etab.description && (
                          <p className="mt-2 text-xs text-white/80">
                            {etab.description.substring(0, 100)}
                            {etab.description.length > 100 ? "..." : ""}
                          </p>
                        )}
                        {etab.adresse && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                            <FiMapPin />
                            <span>{etab.adresse}</span>
                          </div>
                        )}
                      </Link>

                      {isAdmin && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openEditModal(etab);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-white/90"
                            disabled={updatingId === etab.id}
                            title="Modifier cet établissement"
                          >
                            <FiEdit />
                            {updatingId === etab.id ? "..." : "Modifier"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDelete(etab.id);
                            }}
                            disabled={deletingId === etab.id}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                            title="Supprimer cet établissement"
                          >
                            <FiTrash2 />
                            {deletingId === etab.id ? "..." : "Supprimer"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {isModalOpen && currentEtab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink-900">
                Modifier : {currentEtab.nom || "Établissement"}
              </h3>
              <button
                className="rounded-full bg-white/60 p-2 text-ink-600 hover:bg-white/80"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4 text-sm text-ink-700">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Nom</label>
                <input
                  type="text"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  required
                  disabled={updatingId === currentEtab.id}
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Type</label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  required
                  disabled={updatingId === currentEtab.id}
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 focus:outline-none"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Café">Café</option>
                  <option value="Bar">Bar</option>
                  <option value="Fast-Food">Fast-Food</option>
                  <option value="Bistrot">Bistrot</option>
                  <option value="Restaurant Italien">Restaurant Italien</option>
                  <option value="Restaurant Japonais">Restaurant Japonais</option>
                  <option value="Boulangerie">Boulangerie</option>
                  <option value="Pâtisserie">Pâtisserie</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                  disabled={updatingId === currentEtab.id}
                  className="min-h-[120px] w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Adresse</label>
                <input
                  type="text"
                  value={editFormData.adresse}
                  onChange={(e) => setEditFormData({ ...editFormData, adresse: e.target.value })}
                  disabled={updatingId === currentEtab.id}
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Note</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editFormData.note}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, note: parseFloat(e.target.value) })
                  }
                  disabled={updatingId === currentEtab.id}
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-full bg-white/70 px-5 py-2 text-xs font-semibold text-ink-700 hover:bg-white/90"
                  onClick={() => setIsModalOpen(false)}
                  disabled={updatingId === currentEtab.id}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink-700 px-5 py-2 text-xs font-semibold text-white"
                  disabled={updatingId === currentEtab.id}
                >
                  {updatingId === currentEtab.id ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Etablissement;
