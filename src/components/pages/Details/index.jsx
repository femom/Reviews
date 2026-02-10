import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiHeart,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";

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
      
      alert("Votre avis a été ajouté avec succès!");
      
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
            alert("Vous n'avez pas la permission d'ajouter un avis.");
            break;
            
          case 404:
            alert("Route non trouvée. Contactez l'administrateur.");
            break;
            
          case 422:
            const errors = err.response.data.errors;
            if (errors) {
              alert("Erreurs de validation:\n" + 
                Object.values(errors).flat().join("\n"));
            } else {
              alert((err.response.data.message || "Données invalides"));
            }
            break;
            
          case 500:
            const errorMessage = err.response.data?.message || '';
            alert("Erreur serveur: " + errorMessage);
            break;
            
          default:
            alert("Erreur: " + (err.response.data?.message || "Veuillez réessayer."));
        }
      } else if (err.request) {
        alert("Pas de réponse du serveur. Vérifiez votre connexion internet.");
      } else {
        alert("Erreur: " + err.message);
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
      alert("Votre avis a été modifié avec succès!");
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
      
      alert("Votre avis a été supprimé avec succès!");
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
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-20 pt-28 sm:space-y-10 sm:px-6 sm:pb-24 sm:pt-36">
      <div className="fixed left-3 top-3 z-50 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] text-white backdrop-blur animate-fadeUp sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs">
        {checkAuthentication() ? (
          <>
            <FiCheckCircle className="text-emerald-400" />
            <span>Connecté ({getUserName()})</span>
          </>
        ) : (
          <>
            <FiXCircle className="text-rose-400" />
            <span>Déconnecté</span>
          </>
        )}
      </div>

      <section data-reveal className="glass-panel rounded-3xl p-6 md:p-8 animate-fadeUp text-ink-900 dark:text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-ink-900 dark:text-white">{etablissement?.nom || "Nom non disponible"}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-600 dark:text-white/80">
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-700 dark:bg-slate-900/60 dark:text-white/80">
                {etablissement?.type || "Type inconnu"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-ink-900 dark:text-white">{averageRating}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) =>
                    i <= averageRating ? (
                      <FaStar key={i} className="text-amber-400" />
                    ) : (
                      <FiStar key={i} className="text-amber-300" />
                    )
                  )}
                </div>
                <span className="text-xs text-ink-500 dark:text-white/70">({reviews.length} avis)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-white/90 dark:bg-slate-900/60 dark:text-white/80 dark:hover:bg-slate-800/70"
              onClick={toggleFavorite}
              title={favorites ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {favorites ? <FaHeart className="text-rose-500" /> : <FiHeart />}
              <span>{favorites ? "Favori" : "Ajouter aux favoris"}</span>
            </button>

            <div className="glass-soft rounded-2xl px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-white/70">Votre note</p>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    className={`rounded-full p-1 ${i <= rating ? "text-amber-400" : "text-amber-200"}`}
                    onClick={() => setRating(i)}
                    title={`Noter ${i} étoile${i > 1 ? "s" : ""}`}
                  >
                    {i <= rating ? <FaStar /> : <FiStar />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal data-reveal-delay="120ms" className="glass-panel rounded-3xl p-6 text-ink-900 dark:text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Galerie photos</h3>
          {photos.length > 0 && (
            <span className="text-xs text-ink-500 dark:text-white/70">
              {photos.length} photo{photos.length > 1 ? "s" : ""}
              {photos.some((p) => p.isFallback) && " (certaines non disponibles)"}
            </span>
          )}
        </div>

        {loading.images ? (
          <div className="flex items-center gap-3 text-sm text-ink-600 dark:text-white/80">
            <div className="h-3 w-3 animate-pulse rounded-full bg-ink-500" />
            <p>Chargement des photos...</p>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl">
              {photos.length > 0 ? (
                <>
                  <img
                    key={`main-${selectedPhotoIndex}`}
                    src={photos[selectedPhotoIndex]?.url}
                    alt={`Photo ${selectedPhotoIndex + 1} de ${etablissement?.nom}`}
                    className="h-[320px] w-full object-cover md:h-[420px]"
                    onError={(e) => handleImageError(e, selectedPhotoIndex)}
                    loading="lazy"
                  />

                  {photos.length > 1 && (
                    <>
                      <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-ink-700 hover:bg-white/90 dark:bg-slate-900/60 dark:text-white/80 dark:hover:bg-slate-800/70"
                        onClick={prevPhoto}
                        aria-label="Photo précédente"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-ink-700 hover:bg-white/90 dark:bg-slate-900/60 dark:text-white/80 dark:hover:bg-slate-800/70"
                        onClick={nextPhoto}
                        aria-label="Photo suivante"
                      >
                        <FiChevronRight />
                      </button>

                      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-ink-700 dark:bg-slate-900/70 dark:text-white/80">
                        {selectedPhotoIndex + 1} / {photos.length}
                        {photos[selectedPhotoIndex]?.isFallback && (
                          <FiAlertTriangle className="text-amber-500" />
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="relative">
                  <img
                    src={getFallbackImage("Aucune photo disponible")}
                    alt="Aucune photo disponible"
                    className="h-[320px] w-full object-cover md:h-[420px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-sm text-white">
                    Aucune photo disponible pour cet établissement
                  </div>
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-6">
                {photos.map((photo, index) => (
                  <button
                    key={`thumb-${index}`}
                    className={`relative overflow-hidden rounded-xl border ${
                      index === selectedPhotoIndex ? "border-ink-500" : "border-transparent"
                    }`}
                    onClick={() => setSelectedPhotoIndex(index)}
                    aria-label={`Voir la photo ${index + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={`Miniature ${index + 1}`}
                      onError={(e) => handleThumbnailError(e, index)}
                      loading="lazy"
                      className="h-20 w-full object-cover"
                    />
                    {photo.isFallback && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white">
                        <FiAlertTriangle />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {error.images && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                <FiAlertTriangle />
                {error.images}
              </div>
            )}
          </>
        )}
      </section>

      <section data-reveal data-reveal-delay="180ms" className="glass-panel rounded-3xl p-6 text-ink-900 dark:text-white">
        <h3 className="text-lg font-semibold">Description</h3>
        <p className="mt-3 text-sm text-ink-600 dark:text-white/80">
          {etablissement?.description || "Pas de description disponible pour cet établissement."}
        </p>
      </section>

      <section data-reveal data-reveal-delay="240ms" className="grid gap-4 md:grid-cols-2">
        {etablissement?.adresse && (
          <div className="glass-soft flex items-start gap-3 rounded-2xl p-4 text-ink-900 dark:text-white">
            <FiMapPin className="mt-1 text-ink-600 dark:text-white/70" />
            <div>
              <h4 className="text-sm font-semibold">Adresse</h4>
              <p className="text-sm text-ink-600 dark:text-white/80">{etablissement.adresse}</p>
            </div>
          </div>
        )}
        {etablissement?.telephone && (
          <div className="glass-soft flex items-start gap-3 rounded-2xl p-4 text-ink-900 dark:text-white">
            <FiPhone className="mt-1 text-ink-600 dark:text-white/70" />
            <div>
              <h4 className="text-sm font-semibold">Téléphone</h4>
              <p className="text-sm text-ink-600 dark:text-white/80">{etablissement.telephone}</p>
            </div>
          </div>
        )}
        {etablissement?.email && (
          <div className="glass-soft flex items-start gap-3 rounded-2xl p-4 text-ink-900 dark:text-white">
            <FiMail className="mt-1 text-ink-600 dark:text-white/70" />
            <div>
              <h4 className="text-sm font-semibold">Email</h4>
              <p className="text-sm text-ink-600 dark:text-white/80">{etablissement.email}</p>
            </div>
          </div>
        )}
        {etablissement?.site_web && (
          <div className="glass-soft flex items-start gap-3 rounded-2xl p-4 text-ink-900 dark:text-white">
            <FiGlobe className="mt-1 text-ink-600 dark:text-white/70" />
            <div>
              <h4 className="text-sm font-semibold">Site Web</h4>
              <a
                href={etablissement.site_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-600 hover:text-ink-800 dark:text-white/80 dark:hover:text-white"
              >
                {etablissement.site_web}
              </a>
            </div>
          </div>
        )}
      </section>

      <section data-reveal data-reveal-section data-reveal-delay="300ms" className="glass-panel rounded-3xl p-6 text-ink-900 dark:text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Avis des utilisateurs</h3>
          {!userHasReviewed && checkAuthentication() && (
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-white/90 dark:bg-slate-900/60 dark:text-white/80 dark:hover:bg-slate-800/70"
              onClick={() => {
                const form = document.querySelector("#add-review-form");
                if (form) {
                  form.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <FiMessageSquare />
              Donner mon avis
            </button>
          )}
        </div>

        {loading.avis ? (
          <div className="flex items-center gap-3 text-sm text-ink-600 dark:text-white/80">
            <div className="h-3 w-3 animate-pulse rounded-full bg-ink-500" />
            <p>Chargement des avis...</p>
          </div>
        ) : error.avis ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error.avis}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl bg-white/50 px-4 py-6 text-sm text-ink-600 dark:bg-slate-900/50 dark:text-white/80">
            Aucun avis pour le moment.
            {checkAuthentication()
              ? " Soyez le premier à donner votre avis!"
              : " Connectez-vous pour donner votre avis!"}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="glass-soft rounded-2xl p-4 text-ink-900 dark:text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-600 text-sm font-semibold text-white dark:bg-aurora-500">
                      {review.user?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <strong className="block text-sm">
                        {review.user?.name || "Anonyme"}
                      </strong>
                      <span className="text-xs text-ink-500 dark:text-white/70">
                        {new Date(review.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) =>
                        i <= (review.note || 0) ? <FaStar key={i} /> : <FiStar key={i} />
                      )}
                      <span className="ml-2 text-xs text-ink-500 dark:text-white/70">{review.note || 0}/5</span>
                    </div>

                    {checkAuthentication() && review.user_id === currentUserId && (
                      <div className="flex items-center gap-2">
                        {editingReview === review.id ? (
                          <>
                            <button
                              className="rounded-full bg-emerald-500/90 p-2 text-white"
                              onClick={() => handleUpdateReview(review.id)}
                            >
                              <FiSave />
                            </button>
                            <button className="rounded-full bg-white/70 p-2 dark:bg-slate-900/60" onClick={cancelEditing}>
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="rounded-full bg-white/70 p-2 text-ink-700 dark:bg-slate-900/60 dark:text-white/80"
                              onClick={() => startEditing(review)}
                              title="Modifier"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="rounded-full bg-rose-500/90 p-2 text-white"
                              onClick={() => handleDeleteReview(review.id)}
                              title="Supprimer"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {editingReview === review.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-700 focus:outline-none"
                      value={editReviewText}
                      onChange={(e) => setEditReviewText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center gap-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          className={`rounded-full p-1 ${i <= editReviewRating ? "text-amber-400" : "text-amber-200"}`}
                          onClick={() => setEditReviewRating(i)}
                        >
                          {i <= editReviewRating ? <FaStar /> : <FiStar />}
                        </button>
                      ))}
                      <span className="text-xs text-ink-500">{editReviewRating}/5</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-ink-600 dark:text-white/80">{review.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-white/50 p-5 dark:bg-slate-900/50" id="add-review-form">
          <h4 className="text-sm font-semibold">
            {checkAuthentication()
              ? userHasReviewed
                ? "Vous avez déjà donné votre avis"
                : "Ajouter votre avis"
              : "Connectez-vous pour ajouter un avis"}
          </h4>

          {!checkAuthentication() ? (
            <div className="mt-3 flex flex-col gap-3 text-sm text-ink-600 dark:text-white/80 sm:flex-row sm:items-center sm:justify-between">
              <p>Vous devez être connecté pour ajouter un avis.</p>
              <button
                className="rounded-full bg-ink-700 px-5 py-2 text-xs font-semibold text-white"
                onClick={() => navigate("/login")}
              >
                Se connecter
              </button>
            </div>
          ) : userHasReviewed ? (
            <div className="mt-3 text-sm text-ink-600 dark:text-white/80">
              <p>Vous avez déjà partagé votre expérience sur cet établissement.</p>
              <p>Merci pour votre contribution.</p>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-white/70">Votre note</label>
                <div className="mt-2 flex items-center gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      className={`rounded-full p-1 ${i <= rating ? "text-amber-400" : "text-amber-200"}`}
                      onClick={() => setRating(i)}
                      type="button"
                      title={`${i} étoile${i > 1 ? "s" : ""}`}
                    >
                      {i <= rating ? <FaStar /> : <FiStar />}
                    </button>
                  ))}
                  <span className="text-xs text-ink-500 dark:text-white/70">{rating}/5</span>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none dark:border-slate-700/40 dark:bg-slate-900/40 dark:text-white/80 dark:placeholder:text-white/40"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Partagez votre expérience... Que recommandez-vous ? Qu'avez-vous aimé ?"
                  rows={4}
                />
              </div>

              <button
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
                onClick={handleAddReview}
                disabled={!newReview.trim() || rating === 0}
              >
                Publier mon avis
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Details;
