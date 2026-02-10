import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiShield, FiX, FiCheck, FiAlertTriangle, FiUpload, FiPlus } from "react-icons/fi";
import { logger } from "../../../utils/logger.js";

const Addetabs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(null); // null = pas encore vérifié
  
  const [formData, setFormData] = useState({
    nom: '',
    type: 'restaurant',
    adresse: '',
    telephone: '',
    description: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Références pour éviter les problèmes de fermeture
  const isMountedRef = useRef(true);
  const formRef = useRef(null);

  const types = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hôtel' },
    { value: 'musee', label: 'Musée' },
    { value: 'parc', label: 'Parc' },
    { value: 'bar', label: 'Bar' },
    { value: 'cafe', label: 'Café' },
    { value: 'autre', label: 'Autre' }
  ];

  // Vérifier si l'utilisateur est admin au chargement
  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      const user = JSON.parse(userStr);
      logger.info("Admin role check");
        user: user,
        groupe8_role: user.groupe8_role,
        role: user.role,
        is_admin: user.is_admin
      });
      
      const isAdminUser = 
        user.groupe8_role === 'admin' ||
        user.role === 'admin' ||
        user.is_admin === true ||
        user.isAdmin === true;
      
      return isAdminUser;
    } catch (e) {
      logger.error("Admin check error:", e);
      return false;
    }
  };

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    isMountedRef.current = true;
    
    // Vérifier si l'utilisateur est admin
    const adminStatus = checkAdminStatus();
    logger.info("Admin status resolved");
    setIsAdmin(adminStatus);
    
    if (!adminStatus && isMountedRef.current) {
      setError("Accès refusé. Seuls les administrateurs peuvent ajouter des établissements.");
    }
    
    return () => {
      isMountedRef.current = false;
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleChange = (e) => {
    if (!isMountedRef.current || isClosing) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (!isMountedRef.current || isClosing) return;
    
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMountedRef.current) {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Fonction pour vérifier les permissions admin avant de soumettre
  const verifyAdminAccess = async () => {
    try {
      // Testez l'accès admin avec une requête simple
      const testResponse = await api.get('/groupe-8/admin/etablissements');
      logger.info("Admin access test ok");
      return true;
    } catch (testError) {
      logger.warn("Admin access test failed");
      
      if (testError.response?.status === 403) {
        // Essayez de récupérer les infos utilisateur pour debug
        try {
          const userInfo = await api.get('/auth/me');
          logger.info("User info retrieved");
        } catch (userError) {
          logger.warn("Unable to fetch user info");
        }
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isMountedRef.current || isClosing) {
      e.stopPropagation();
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info("Verifying permissions");

      const etablissementData = {
        nom: formData.nom.trim(),
        type: formData.type,
        adresse: formData.adresse.trim(),
        telephone: formData.telephone.trim() || null,
        description: formData.description.trim() || null
      };
      
      logger.info("Submitting establishment");
      
      const response = await api.post(
        '/groupe-8/admin/etablissements',
        etablissementData
      );
      
      logger.info("Creation response received");
      
      const etablissementId = response.data.id || 
                             response.data.data?.id;
      
      // Upload de l'image si fournie
      if (etablissementId && image && isMountedRef.current) {
        try {
          const formDataImage = new FormData();
          formDataImage.append('image', image);
          
          await api.post(
            `/groupe-8/etablissements/${etablissementId}/images`,
            formDataImage,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          logger.info("Image upload ok");
        } catch (imageError) {
          logger.warn("Image upload error:", imageError.message);
          // Ne pas bloquer le succès principal
        }
      }
      
      if (isMountedRef.current) {
        setSuccess('Établissement créé avec succès.');
        
        setTimeout(() => {
          if (isMountedRef.current) {
            closeModal();
          }
        }, 2000);
      }
      
    } catch (error) {
      logger.error("Add establishment error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (!isMountedRef.current) return;
      
      if (error.response?.status === 403) {
        setError(`
          Permission refusée.

          Raisons possibles :
          1. Votre compte n'est pas administrateur
          2. Votre token a expiré
          3. Vous n'avez pas les permissions nécessaires

          Rôle détecté : ${isAdmin ? 'Admin' : 'Non-admin'}
          Token : ${localStorage.getItem('token') ? 'Présent' : 'Absent'}
        `);
        
        // Proposer de se reconnecter
        setTimeout(() => {
          if (confirm("Voulez-vous vous reconnecter ?")) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }, 1000);
        
      } else if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else if (error.message === "Permission administrateur requise") {
        setError("Permission administrateur requise. Vérifiez votre rôle.");
      } else {
        setError(error.response?.data?.message || 'Erreur lors de la création');
      }
    } finally {
      if (isMountedRef.current && !isClosing) {
        setLoading(false);
      }
    }
  };

  const closeModal = useCallback(() => {
    if (isClosing || !isMountedRef.current) return;
    
    setIsClosing(true);
    
    setTimeout(() => {
      if (isMountedRef.current) {
        navigate('/');
      }
    }, 300);
  }, [isClosing, navigate]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay') && !isClosing && !loading) {
      closeModal();
    }
  };

  // Gestionnaire d'événement pour Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isMountedRef.current && !isClosing && !loading) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey, true);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey, true);
    };
  }, [isClosing, loading, closeModal]);



  
  // Si en cours de fermeture
  if (isClosing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
        <div className="glass-panel h-24 w-24 animate-pulse rounded-3xl" />
      </div>
    );
  }

  // Rendu normal (utilisateur est admin)
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="flex items-center gap-2 text-xl font-semibold text-ink-900">
            <FiShield className="text-ink-600" />
            Ajouter un établissement (Admin)
          </h2>
          <button
            className="rounded-full bg-white/60 p-2 text-ink-600 hover:bg-white/80"
            onClick={closeModal}
            aria-label="Fermer"
            disabled={loading || isClosing}
            type="button"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <FiCheck />
              {success}
            </div>
          )}
          
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <FiAlertTriangle className="mt-0.5" />
              <div>
                {error.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}
          
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-semibold text-ink-700">
              <FiShield />
              Mode Administrateur
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nom" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  disabled={loading || isClosing}
                  placeholder="Nom de l'établissement"
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={loading || isClosing}
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-800 focus:outline-none"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="adresse" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Adresse *</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
                disabled={loading || isClosing}
                placeholder="Adresse complète"
                className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="telephone" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={loading || isClosing}
                  placeholder="0123456789"
                  className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                disabled={loading || isClosing}
                placeholder="Description de l'établissement..."
                className="min-h-[120px] w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Image</label>
              <div className="glass-soft rounded-2xl p-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading || isClosing}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="h-48 w-full object-cover" 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!isClosing && isMountedRef.current) {
                          setImage(null);
                          setImagePreview(null);
                        }
                      }}
                      className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-ink-700 hover:bg-white"
                      disabled={loading || isClosing}
                      aria-label="Supprimer l'image"
                    >
                      <FiX />
                    </button>
                    <label
                      htmlFor="image"
                      className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-white"
                    >
                      Changer
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/50 px-4 py-6 text-center text-sm text-ink-600 hover:bg-white/30"
                  >
                    <FiUpload className="text-2xl text-ink-500" />
                    <span className="font-medium">Cliquez pour télécharger une image</span>
                    <span className="text-xs text-ink-500">PNG, JPG, JPEG - Max 5MB</span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={loading || isClosing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
              >
                {loading ? (
                  <>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Créer l'établissement
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={closeModal}
                disabled={loading || isClosing}
                className="rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-white/90"
              >
                Annuler
              </button>
            </div>
            
            <p className="text-xs text-ink-500">* Champs obligatoires</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addetabs;
