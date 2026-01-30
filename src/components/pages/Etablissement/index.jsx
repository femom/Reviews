import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./etabs.css";
import { useAuth } from "../../context/AuthContext.jsx";

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
    
    console.log("🔐 Détermination du statut admin:", {
      userNameFromStorage: userName,
      isAdminFromLocalStorage,
      roleFromContext: role,
      userFromContext: user,
      isAdminFromContext,
      isAdminFromUserName,
      finalAdminStatus: adminStatus
    });
    
    setIsAdmin(adminStatus);
    
    // Log pour debug
    if (adminStatus) {
      console.log("✅ Utilisateur identifié comme ADMIN");
    } else {
      console.log("❌ Utilisateur NON ADMIN");
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
        
        console.log("🔄 Tentative de connexion à l'API...");
        const res = await api.get("/groupe-8/etablissements");
        
        if (isMounted) {
          console.log("✅ Réponse API reçue:", res.data);
          
          let data;
          if (res.data && Array.isArray(res.data)) {
            data = res.data;
          } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          } else if (res.data && res.data.etablissements && Array.isArray(res.data.etablissements)) {
            data = res.data.etablissements;
          } else {
            console.warn("⚠️ Structure de données inattendue:", res.data);
            data = [];
          }
          
          if (!Array.isArray(data)) {
            console.warn("⚠️ Les données de l'API ne sont pas un tableau:", data);
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
                console.error("❌ Erreur lors du traitement d'un établissement:", error);
              }
            }
            
            return processedEtabs;
          };
          
          const processedData = await processEtabs();
          setEtablissements(processedData);
          setEtabsWithImages(processedData);
        }
      } catch (err) {
        console.error("❌ Erreur fetchData:", err);
        
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
        console.log(`📸 Image API pour ${etabId}:`, response.data);
        
        if (response.data && response.data.length > 0) {
          const firstImage = response.data[0];
          return firstImage.url || firstImage.imageUrl || firstImage.path;
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de charger l'image pour ${etabId}:`, error.message);
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
          console.error(`Erreur image pour ${etab.id}:`, err);
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
    
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.")) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      if (etablissements === fallbackEtablissements) {
        setEtablissements(prev => prev.filter(item => item.id !== id));
        setEtabsWithImages(prev => prev.filter(item => item.id !== id));
        alert("✅ Établissement supprimé (mode démo).");
        setDeletingId(null);
        return;
      }

      // Utiliser le token du localStorage directement
      const authToken = token || localStorage.getItem('authToken');
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      try {
        await api.delete(`/groupe-8/images/${id}`, { headers });
        console.log(`✅ Images supprimées pour l'établissement ${id}`);
      } catch (imgError) {
        console.warn(`⚠️ Impossible de supprimer les images: ${imgError.message}`);
      }
      
      await api.delete(`/groupe-8/admin/etablissements/${id}`, { headers });
      
      setEtablissements(prev => prev.filter(item => item.id !== id));
      setEtabsWithImages(prev => prev.filter(item => item.id !== id));
      
      alert("✅ Établissement supprimé avec succès.");
    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      
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
      console.error("❌ Erreur lors de la mise à jour:", err);
      
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
    <div className="placing">
      {/* Espace pour éviter que le contenu soit caché */}
      <div className="navbar-spacer"></div>
      
      <div className="etabs-header">
        <h2>{typeFromUrl 
          ? (typeFromUrl.charAt(0).toUpperCase() + typeFromUrl.slice(1) + "s") 
          : (title || "Tous les établissements")}
        </h2>

      </div>

      {error && etablissements === fallbackEtablissements && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Chargement des établissements...</p>
        </div>
      ) : (
        <>
          {!filtered || filtered.length === 0 ? (
            <div className="no-results">
              <p>Aucun établissement trouvé.</p>
              <button onClick={() => navigate("/")} className="btn-primary">
                Voir tous les établissements
              </button>
            </div>
          ) : (
            <div className="cards-container">
              {filtered.map((etab) => {
                if (!etab) return null;
                
                const isFavorite = Array.isArray(favorites) && favorites.includes(etab.id);
                const currentRating = etab.note || etab.moyenne || etab.rating || 3.5;
                const imageUrl = coverImages[etab.id] || etab.image || etabImages[0];
                
                return (
                  <div 
                    className="card" 
                    key={etab.id || `etab-${Math.random()}`}
                    style={{ 
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="card-rating">
                      ★ {typeof currentRating === 'number' ? currentRating.toFixed(1) : "3.5"}
                    </div>
                    
                    {/* Bouton favori */}
                    <button 
                      className={`fav-btn-overlay ${isFavorite ? "active" : ""}`}
                      data-id={etab.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(etab.id);
                      }}
                      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavorite ? (
                        <span className="heart-icon">❤️</span>
                      ) : (
                        <span className="heart-icon">🤍</span>
                      )}
                      <span className="fav-tooltip">
                        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      </span>
                    </button>
                    
                    <div className="card-overlay">
                      <div className="card-info">
                        <Link to={`/details/${etab.id}`} className="card-link">
                          <h3>{etab.nom || "Nom inconnu"}</h3>
                          <p className="type-tag">{etab.type || "Non spécifié"}</p>
                          {etab.description && (
                            <p className="card-description">
                              {etab.description.substring(0, 100)}
                              {etab.description.length > 100 ? "..." : ""}
                            </p>
                          )}
                          {etab.adresse && (
                            <span className="card-address">📍 {etab.adresse}</span>
                          )}
                        </Link>
                        
                        {/* BOUTONS ADMIN - Version corrigée */}
                        {isAdmin && (
                          <div className="admin-controls">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                openEditModal(etab);
                              }} 
                              className="edit-btn"
                              disabled={updatingId === etab.id}
                              title="Modifier cet établissement"
                            >
                              {updatingId === etab.id ? "..." : "Modifier"}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete(etab.id);
                              }} 
                              disabled={deletingId === etab.id} 
                              className="delete-btn"
                              title="Supprimer cet établissement"
                            >
                              {deletingId === etab.id ? "..." : "Supprimer"}
                            </button>
                          </div>
                        )}
                        
                        {etab.id && (
                          <Link 
                            to={`/details/${etab.id}`} 
                            className="details-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Voir les détails complets"
                          >
                            Voir les détails →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* --- MODALE DE MODIFICATION --- */}
      {isModalOpen && currentEtab && (
        <div className="modal-overlay">
          <div className="modal-content admin-theme">
            <h3>Modifier : {currentEtab.nom || "Établissement"}</h3>
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label>Nom</label>
                <input 
                  type="text" 
                  value={editFormData.nom} 
                  onChange={(e) => setEditFormData({...editFormData, nom: e.target.value})} 
                  required 
                  disabled={updatingId === currentEtab.id}
                />
              </div>
              <div className="field">
                <label>Type</label>
                <select 
                  value={editFormData.type} 
                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                  required
                  disabled={updatingId === currentEtab.id}
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
              <div className="field">
                <label>Description</label>
                <textarea 
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
                  required 
                  disabled={updatingId === currentEtab.id}
                />
              </div>
              <div className="field">
                <label>Adresse</label>
                <input 
                  type="text" 
                  value={editFormData.adresse} 
                  onChange={(e) => setEditFormData({...editFormData, adresse: e.target.value})} 
                  disabled={updatingId === currentEtab.id}
                />
              </div>
              <div className="field">
                <label>Note</label>
                <input 
                  type="number" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  value={editFormData.note} 
                  onChange={(e) => setEditFormData({...editFormData, note: parseFloat(e.target.value)})} 
                  disabled={updatingId === currentEtab.id}
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={updatingId === currentEtab.id}
                >
                  {updatingId === currentEtab.id ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={updatingId === currentEtab.id}
                >
                  Annuler
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