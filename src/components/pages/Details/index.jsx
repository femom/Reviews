import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import "./details.css";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [etablissement, setEtablissement] = useState(null);
  const [favorites, setFavorites] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState({
    etablissement: true,
    avis: true,
    images: true
  });
  const [error, setError] = useState({
    etablissement: null,
    avis: null,
    images: null
  });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(0);

  // Références pour les images chargées
  const loadedImages = useRef(new Set());

  // Fonctions de navigation pour les photos
  const nextPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  // Fonction pour vérifier si une image existe
  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // Image de fallback locale SVG
  const getFallbackImage = (text = "Image non disponible") => {
    // SVG simple encodé en base64
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f5f5f5"/>
      <rect x="50" y="50" width="300" height="200" fill="#e0e0e0" stroke="#ccc" stroke-width="1"/>
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">${text}</text>
      <text x="200" y="190" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">${etablissement?.nom || ''}</text>
    </svg>`;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`;
  };

  // Fonction pour construire l'URL complète de l'image
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Si c'est un chemin relatif
    if (imagePath.startsWith('/')) {
      // Récupérer l'URL de base de l'API
      let baseUrl = '';
      
      if (api.defaults.baseURL) {
        baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
      } else {
        // URL par défaut
        baseUrl = window.location.origin;
      }
      
      return `${baseUrl}${imagePath}`;
    }
    
    return imagePath;
  };

  // Fonction pour gérer les erreurs d'image principale
  const handleImageError = async (e, photoIndex) => {
    console.warn(`Image échouée à l'index ${photoIndex}, utilisation du fallback`);
    
    const photo = photos[photoIndex];
    if (!photo) return;
    
    // Utiliser directement l'image fallback
    e.target.src = getFallbackImage("Image non disponible");
    e.target.onerror = null; // Éviter les boucles infinies
    
    // Marquer cette image comme fallback dans l'état
    if (!photo.isFallback) {
      const updatedPhotos = [...photos];
      updatedPhotos[photoIndex] = {
        ...photo,
        url: getFallbackImage("Image non disponible"),
        originalUrl: photo.url, // Conserver l'URL originale
        isFallback: true
      };
      setPhotos(updatedPhotos);
    }
  };

  // Fonction pour gérer les erreurs d'image miniature
  const handleThumbnailError = (e, index) => {
    console.warn(`Miniature échouée à l'index ${index}`);
    e.target.src = getFallbackImage("X");
    e.target.onerror = null;
    
    // Marquer comme fallback
    if (photos[index] && !photos[index].isFallback) {
      const updatedPhotos = [...photos];
      updatedPhotos[index] = {
        ...photos[index],
        url: getFallbackImage("X"),
        originalUrl: photos[index].url,
        isFallback: true
      };
      setPhotos(updatedPhotos);
    }
  };

  // Fonction pour prélire les images
  const preloadImages = async (imageUrls) => {
    const results = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const fullUrl = buildImageUrl(url);
      
      if (loadedImages.current.has(fullUrl)) {
        results.push({ url: fullUrl, exists: true });
        continue;
      }
      
      try {
        const exists = await checkImageExists(fullUrl);
        loadedImages.current.add(fullUrl);
        results.push({ 
          url: fullUrl, 
          exists,
          fallbackUrl: exists ? fullUrl : getFallbackImage("Image non disponible")
        });
      } catch (error) {
        console.error(`Erreur préchargement image ${i}:`, error);
        results.push({ 
          url: fullUrl, 
          exists: false,
          fallbackUrl: getFallbackImage("Image non disponible")
        });
      }
    }
    
    return results;
  };

  // ============ FONCTIONS D'AUTHENTIFICATION ============
  
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  const getUserId = () => {
    if (user && user.id) {
      return parseInt(user.id);
    }
    
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const userData = JSON.parse(userStr);
        return userData.id ? parseInt(userData.id) : null;
      } catch (e) {
        console.error("Erreur parsing user:", e);
        return null;
      }
    }
    
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  };

  const getUserName = () => {
    if (user && user.name) {
      return user.name;
    }
    
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const userData = JSON.parse(userStr);
        return userData.name || userData.email || userData.username || "Utilisateur";
      } catch (e) {
        console.error("Erreur parsing user pour nom:", e);
      }
    }
    
    return localStorage.getItem('userName') || "Utilisateur";
  };

  const checkAuthentication = () => {
    const token = getAuthToken();
    const contextAuth = isAuthenticated ? isAuthenticated() : false;
    
    return token || contextAuth;
  };

  // ============ GESTION DES AVIS ============

  useEffect(() => {
    const handleFavoritesUpdate = (event) => {
      if (!event.detail.isFavorite) {
        // Logique pour rafraîchir les favoris
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const handleAddReview = async () => {
    console.log("🔄 Début handleAddReview");
    
    if (!checkAuthentication()) {
      alert("Veuillez vous connecter pour ajouter un avis.");
      navigate('/login');
      return;
    }

    if (newReview.trim() === "") {
      alert("Veuillez écrire un avis.");
      return;
    }
    
    if (rating === 0) {
      alert("Veuillez attribuer une note.");
      return;
    }

    try {
      const userId = getUserId();
      const reviewData = {
        commentaire: newReview,
        note: rating,
        etablissement_id: parseInt(id),
        user_id: userId
      };
      
      console.log("📤 Envoi avis avec données:", reviewData);
      
      let endpoint;
      
      if (api.defaults.baseURL && api.defaults.baseURL.endsWith('/api')) {
        endpoint = `/groupe-8/etablissements/${id}/avis`;
      } else {
        endpoint = `/api/groupe-8/etablissements/${id}/avis`;
      }
      
      console.log("Endpoint utilisé:", endpoint);
      
      const response = await api.post(endpoint, reviewData);
      
      console.log("✅ Réponse API:", response.data);
      
      const responseData = response.data;
      
      const newReviewObj = {
        id: responseData.id || 
            responseData.data?.id || 
            Date.now(),
        user: {
          id: userId,
          name: getUserName()
        },
        user_id: userId,
        commentaire: newReview,
        note: rating,
        created_at: new Date().toISOString(),
        ...(responseData.data || {})
      };
      
      console.log("Nouvel avis créé:", newReviewObj);
      
      setReviews(prev => [newReviewObj, ...prev]);
      
      setNewReview("");
      setRating(0);
      
      await fetchAvis();
      
      alert("✅ Votre avis a été ajouté avec succès!");
      
    } catch (err) {
      console.error("❌ Erreur ajout avis:", err.response || err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            alert("⏰ Session expirée. Veuillez vous reconnecter.");
            if (logout) {
              logout();
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              localStorage.removeItem('userId');
            }
            navigate('/login');
            break;
            
          case 403:
            alert("🚫 Vous n'avez pas la permission d'ajouter un avis.");
            break;
            
          case 404:
            alert("❌ Route non trouvée. Contactez l'administrateur.");
            break;
            
          case 422:
            const errors = err.response.data.errors;
            if (errors) {
              alert("❌ Erreurs de validation:\n" + 
                Object.values(errors).flat().join("\n"));
            } else {
              alert("❌ " + (err.response.data.message || "Données invalides"));
            }
            break;
            
          case 500:
            const errorMessage = err.response.data?.message || '';
            alert("❌ Erreur serveur: " + errorMessage);
            break;
            
          default:
            alert("⚠️ Erreur: " + (err.response.data?.message || "Veuillez réessayer."));
        }
      } else if (err.request) {
        alert("🌐 Pas de réponse du serveur. Vérifiez votre connexion internet.");
      } else {
        alert("❌ Erreur: " + err.message);
      }
    }
  };

  const handleUpdateReview = async (reviewId) => {
    if (!checkAuthentication()) {
      alert("Veuillez vous connecter pour modifier votre avis.");
      navigate('/login');
      return;
    }

    if (editReviewText.trim() === "") {
      alert("Veuillez écrire un avis.");
      return;
    }
    
    if (editReviewRating === 0) {
      alert("Veuillez attribuer une note.");
      return;
    }

    try {
      const reviewData = {
        commentaire: editReviewText,
        note: editReviewRating,
        _method: 'PUT'
      };
      
      await api.post(`/groupe-8/avis/${reviewId}`, reviewData);
      
      await fetchAvis();
      
      setEditingReview(null);
      setEditReviewText("");
      setEditReviewRating(0);
      alert("✅ Votre avis a été modifié avec succès!");
    } catch (err) {
      console.error("Erreur modification avis:", err);
      handleApiError(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!checkAuthentication()) {
      alert("Veuillez vous connecter pour supprimer votre avis.");
      navigate('/login');
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    try {
      await api.delete(`/groupe-8/avis/${reviewId}`);
      
      await fetchAvis();
      
      alert("✅ Votre avis a été supprimé avec succès!");
    } catch (err) {
      console.error("Erreur suppression avis:", err);
      handleApiError(err);
    }
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      alert("Session expirée. Veuillez vous reconnecter.");
      if (logout) {
        logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      navigate('/login');
    } else {
      alert("Erreur: " + (err.response?.data?.message || "Veuillez réessayer."));
    }
  };

  const startEditing = (review) => {
    setEditingReview(review.id);
    setEditReviewText(review.commentaire);
    setEditReviewRating(review.note);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditReviewText("");
    setEditReviewRating(0);
  };

  // ============ EFFECTS ET FETCHING ============

  // Récupérer les détails de l'établissement
  useEffect(() => {
    const fetchEtablissement = async () => {
      setLoading(prev => ({...prev, etablissement: true}));
      try {
        const res = await api.get(`/groupe-8/etablissements/${id}`);
        setEtablissement(res.data.data || res.data);
        setError(prev => ({...prev, etablissement: null}));
        
        const favoritesList = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(favoritesList.includes(id));
      } catch (err) {
        console.error("Erreur récupération établissement:", err);
        setError(prev => ({
          ...prev, 
          etablissement: "Impossible de récupérer les détails de l'établissement."
        }));
      } finally {
        setLoading(prev => ({...prev, etablissement: false}));
      }
    };
    fetchEtablissement();
  }, [id]);

  // Récupérer et précharger les images
  useEffect(() => {
    const fetchAndProcessImages = async () => {
      setLoading(prev => ({...prev, images: true}));
      
      try {
        // D'abord, essayer l'endpoint d'images
        let imagesData = [];
        try {
          const res = await api.get(`/groupe-8/etablissements/${id}/images`);
          imagesData = res.data.data || res.data || [];
        } catch (apiError) {
          console.warn("API images échouée, essai des images de l'établissement");
          // Si l'API échoue, utiliser les images de l'établissement
          if (etablissement?.images?.length > 0) {
            imagesData = etablissement.images.map(img => ({ url: img }));
          }
        }

        // Si aucune image n'est disponible, créer un fallback
        if (imagesData.length === 0) {
          const fallbackImage = {
            url: getFallbackImage(etablissement?.nom || "Aucune image disponible"),
            isFallback: true
          };
          setPhotos([fallbackImage]);
          setError(prev => ({...prev, images: null}));
          return;
        }

        // Extraire les URLs des images
        const imageUrls = imagesData.map(img => img.url || img);
        
        // Précharger et vérifier les images
        const preloadedResults = await preloadImages(imageUrls);
        
        // Transformer les résultats en objets photo
        const processedPhotos = preloadedResults.map((result, index) => {
          const originalImage = imagesData[index];
          return {
            ...originalImage,
            url: result.exists ? result.url : result.fallbackUrl,
            originalUrl: result.url,
            isFallback: !result.exists,
            exists: result.exists
          };
        });

        setPhotos(processedPhotos);
        setError(prev => ({...prev, images: null}));
        
        console.log(`✅ ${processedPhotos.filter(p => p.exists).length}/${processedPhotos.length} images chargées avec succès`);

      } catch (err) {
        console.error("Erreur traitement images:", err);
        
        // En cas d'erreur, utiliser un fallback
        const fallbackImage = {
          url: getFallbackImage(etablissement?.nom || "Erreur chargement images"),
          isFallback: true
        };
        setPhotos([fallbackImage]);
        
        setError(prev => ({
          ...prev, 
          images: "Impossible de charger les images. Utilisation des images de secours."
        }));
      } finally {
        setLoading(prev => ({...prev, images: false}));
      }
    };
    
    if (id && etablissement) {
      fetchAndProcessImages();
    }
  }, [id, etablissement]);

  // Fonction pour récupérer les avis
  const fetchAvis = async () => {
    setLoading(prev => ({...prev, avis: true}));
    try {
      const res = await api.get(`/groupe-8/etablissements/${id}/avis`);
      const avisData = res.data.data || res.data || [];
      setReviews(avisData);
      setError(prev => ({...prev, avis: null}));
    } catch (err) {
      console.error("Erreur récupération avis:", err);
      setError(prev => ({
        ...prev, 
        avis: "Impossible de charger les avis."
      }));
    } finally {
      setLoading(prev => ({...prev, avis: false}));
    }
  };

  // Récupérer les avis
  useEffect(() => {
    if (id) {
      fetchAvis();
    }
  }, [id]);

  // ============ LOGIQUE DES FAVORIS ============

  const toggleFavorite = () => {
    const newFavStatus = !favorites;
    setFavorites(newFavStatus);
    
    const favoritesList = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (newFavStatus) {
      if (!favoritesList.includes(id)) {
        favoritesList.push(id);
      }
    } else {
      const index = favoritesList.indexOf(id);
      if (index > -1) {
        favoritesList.splice(index, 1);
      }
    }
    
    localStorage.setItem('favorites', JSON.stringify(favoritesList));
    
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
      detail: { id, isFavorite: newFavStatus }
    }));
  };

  // ============ RENDER ============

  if (loading.etablissement && !etablissement) {
    return (
      <div className="details-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + (review.note || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  // Vérifier si l'utilisateur a déjà posté un avis
  const currentUserId = getUserId();
  const userHasReviewed = currentUserId 
    ? reviews.some(review => 
        review.user_id === currentUserId || 
        review.user?.id === currentUserId
      )
    : false;

  return (
    <div className="details-wrapper">
      {/* Indicateur d'authentification */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: checkAuthentication() ? '#28a745' : '#dc3545',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        {checkAuthentication() ? `✅ Connecté (${getUserName()})` : '❌ Déconnecté'}
      </div>

      {/* En-tête */}
      <div className="details-header">
        <div className="details-header-content">
          <div className="details-header-info">
            <h2 className="details-title">{etablissement?.nom || "Nom non disponible"}</h2>
            <div className="details-meta">
              <span className="details-type-badge">{etablissement?.type || "Type inconnu"}</span>
              <div className="details-rating-display">
                <span className="details-average-rating">{averageRating}</span>
                <div className="details-stars-static">
                  {[1,2,3,4,5].map(i => (
                    <span
                      key={i}
                      className={i <= averageRating ? "details-star filled" : "details-star"}
                    >★</span>
                  ))}
                </div>
                <span className="details-review-count">({reviews.length} avis)</span>
              </div>
            </div>
          </div>
          
          <div className="details-header-actions">
            <button
              className={`details-fav-btn ${favorites ? "active" : ""}`}
              onClick={toggleFavorite}
              title={favorites ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {favorites ? "❤️" : "🤍"}
              <span>{favorites ? "Favori" : "Ajouter aux favoris"}</span>
            </button>
            
            {/* Notation interactive pour nouvel avis */}
            <div className="details-rating-widget">
              <p className="rating-label">Votre note :</p>
              <div className="details-stars-interactive">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    className={`details-star-btn ${i <= rating ? "active" : ""}`}
                    onClick={() => setRating(i)}
                    title={`Noter ${i} étoile${i > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galerie de photos avec gestion améliorée */}
      <div className="details-photos-section">
        <div className="section-header">
          <h3 className="section-title">Galerie photos</h3>
          {photos.length > 0 && (
            <span className="photo-count">
              {photos.length} photo{photos.length > 1 ? 's' : ''}
              {photos.some(p => p.isFallback) && ' (certaines non disponibles)'}
            </span>
          )}
        </div>
        
        {loading.images ? (
          <div className="photos-loading">
            <div className="loading-spinner small"></div>
            <p>Chargement des photos...</p>
          </div>
        ) : (
          <>
            <div className="main-photo-container">
              {photos.length > 0 ? (
                <>
                  <img 
                    key={`main-${selectedPhotoIndex}`}
                    src={photos[selectedPhotoIndex]?.url} 
                    alt={`Photo ${selectedPhotoIndex + 1} de ${etablissement?.nom}`}
                    className="main-photo"
                    onError={(e) => handleImageError(e, selectedPhotoIndex)}
                    loading="lazy"
                  />
                  
                  {photos.length > 1 && (
                    <>
                      <button 
                        className="photo-nav-btn prev"
                        onClick={prevPhoto}
                        aria-label="Photo précédente"
                      >
                        ‹
                      </button>
                      <button 
                        className="photo-nav-btn next"
                        onClick={nextPhoto}
                        aria-label="Photo suivante"
                      >
                        ›
                      </button>
                      
                      <div className="photo-counter">
                        {selectedPhotoIndex + 1} / {photos.length}
                        {photos[selectedPhotoIndex]?.isFallback && (
                          <span className="fallback-indicator" title="Image non disponible">⚠️</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-photos-main">
                  <img 
                    src={getFallbackImage("Aucune photo disponible")} 
                    alt="Aucune photo disponible"
                    className="main-photo"
                  />
                  <div className="no-photos-overlay">
                    <p>Aucune photo disponible pour cet établissement</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Miniatures */}
            {photos.length > 1 && (
              <div className="photo-thumbnails">
                {photos.map((photo, index) => (
                  <button
                    key={`thumb-${index}`}
                    className={`thumbnail ${index === selectedPhotoIndex ? 'active' : ''} ${
                      photo.isFallback ? 'fallback' : ''
                    }`}
                    onClick={() => setSelectedPhotoIndex(index)}
                    aria-label={`Voir la photo ${index + 1}`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Miniature ${index + 1}`}
                      onError={(e) => handleThumbnailError(e, index)}
                      loading="lazy"
                    />
                    {photo.isFallback && (
                      <div className="thumbnail-fallback-indicator" title="Image non disponible">
                        ⚠️
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {error.images && (
              <div className="photos-warning">
                <p>⚠️ {error.images}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Description */}
      <div className="details-description-section">
        <h3 className="section-title">Description</h3>
        <div className="description-content">
          <p>{etablissement?.description || "Pas de description disponible pour cet établissement."}</p>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="details-info-grid">
        {etablissement?.adresse && (
          <div className="info-card">
            <span className="info-icon">📍</span>
            <div>
              <h4>Adresse</h4>
              <p>{etablissement.adresse}</p>
            </div>
          </div>
        )}
        
        {etablissement?.telephone && (
          <div className="info-card">
            <span className="info-icon">📞</span>
            <div>
              <h4>Téléphone</h4>
              <p>{etablissement.telephone}</p>
            </div>
          </div>
        )}
        
        {etablissement?.email && (
          <div className="info-card">
            <span className="info-icon">✉️</span>
            <div>
              <h4>Email</h4>
              <p>{etablissement.email}</p>
            </div>
          </div>
        )}
        
        {etablissement?.site_web && (
          <div className="info-card">
            <span className="info-icon">🌐</span>
            <div>
              <h4>Site Web</h4>
              <a href={etablissement.site_web} target="_blank" rel="noopener noreferrer">
                {etablissement.site_web}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Avis des utilisateurs */}
      <div className="details-reviews-section">
        <div className="section-header">
          <h3 className="section-title">Avis des utilisateurs</h3>
          {!userHasReviewed && checkAuthentication() && (
            <button 
              className="add-review-toggle"
              onClick={() => {
                const form = document.querySelector('.add-review-form');
                if (form) {
                  form.scrollIntoView({behavior: 'smooth'});
                }
              }}
            >
              ✍️ Donner mon avis
            </button>
          )}
        </div>

        {loading.avis ? (
          <div className="reviews-loading">
            <div className="loading-spinner small"></div>
            <p>Chargement des avis...</p>
          </div>
        ) : error.avis ? (
          <div className="reviews-error">
            <p>{error.avis}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>😔 Aucun avis pour le moment. 
              {checkAuthentication() 
                ? " Soyez le premier à donner votre avis!" 
                : " Connectez-vous pour donner votre avis!"}
            </p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-avatar">
                      {review.user?.name?.charAt(0) || "A"}
                    </span>
                    <div>
                      <strong className="reviewer-name">
                        {review.user?.name || "Anonyme"}
                      </strong>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="review-actions">
                    <div className="review-stars">
                      {"★".repeat(review.note || 0)}
                      {"☆".repeat(5 - (review.note || 0))}
                      <span className="review-rating">{review.note || 0}/5</span>
                    </div>
                    
                    {/* Boutons d'action pour l'utilisateur connecté */}
                    {checkAuthentication() && review.user_id === currentUserId && (
                      <div className="review-buttons">
                        {editingReview === review.id ? (
                          <>
                            <button 
                              className="review-btn save-btn"
                              onClick={() => handleUpdateReview(review.id)}
                            >
                              💾
                            </button>
                            <button 
                              className="review-btn cancel-btn"
                              onClick={cancelEditing}
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="review-btn edit-btn"
                              onClick={() => startEditing(review)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button 
                              className="review-btn delete-btn"
                              onClick={() => handleDeleteReview(review.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mode édition */}
                {editingReview === review.id ? (
                  <div className="edit-review-form">
                    <textarea
                      className="edit-review-textarea"
                      value={editReviewText}
                      onChange={(e) => setEditReviewText(e.target.value)}
                      rows={3}
                    />
                    <div className="edit-rating">
                      {[1,2,3,4,5].map(i => (
                        <button
                          key={i}
                          className={`edit-rating-star ${i <= editReviewRating ? 'selected' : ''}`}
                          onClick={() => setEditReviewRating(i)}
                        >
                          ★
                        </button>
                      ))}
                      <span className="edit-rating-value">{editReviewRating}/5</span>
                    </div>
                  </div>
                ) : (
                  <p className="review-comment">{review.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout d'avis */}
        <div className="add-review-form" id="add-review-form">
          <h4 className="form-title">
            {checkAuthentication() 
              ? (userHasReviewed ? "Vous avez déjà donné votre avis" : "Ajouter votre avis")
              : "Connectez-vous pour ajouter un avis"}
          </h4>
          
          {!checkAuthentication() ? (
            <div className="login-prompt">
              <p>Vous devez être connecté pour ajouter un avis.</p>
              <button 
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </button>
            </div>
          ) : userHasReviewed ? (
            <div className="already-reviewed">
              <p>✅ Vous avez déjà partagé votre expérience sur cet établissement.</p>
              <p>Merci pour votre contribution!</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Votre note :</label>
                <div className="rating-input">
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      className={`rating-star ${i <= rating ? 'selected' : ''}`}
                      onClick={() => setRating(i)}
                      type="button"
                      title={`${i} étoile${i > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-value">{rating}/5</span>
                </div>
              </div>
              
              <div className="form-group">
                <textarea
                  className="review-textarea"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Partagez votre expérience... Que recommandez-vous ? Qu'avez-vous aimé ?"
                  rows={4}
                />
              </div>
              
              <button 
                className="submit-review-btn"
                onClick={handleAddReview}
                disabled={!newReview.trim() || rating === 0}
              >
                Publier mon avis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Details;