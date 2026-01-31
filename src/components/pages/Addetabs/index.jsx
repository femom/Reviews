import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  HiShieldCheck,
  HiX,
  HiCheck,
  HiExclamationCircle,
  HiPlus,
  HiPhotograph,
} from "react-icons/hi";
import { Modal } from "../../ui";

const Addetabs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(null); // null = pas encore vérifié

  const [formData, setFormData] = useState({
    nom: "",
    type: "restaurant",
    adresse: "",
    telephone: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Références pour éviter les problèmes de fermeture
  const isMountedRef = useRef(true);
  const formRef = useRef(null);

  const types = [
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hôtel" },
    { value: "musee", label: "Musée" },
    { value: "parc", label: "Parc" },
    { value: "bar", label: "Bar" },
    { value: "cafe", label: "Café" },
    { value: "autre", label: "Autre" },
  ];

  // Vérifier si l'utilisateur est admin au chargement
  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return false;

      const user = JSON.parse(userStr);
      console.log("Vérification rôle admin:", {
        user: user,
        groupe8_role: user.groupe8_role,
        role: user.role,
        is_admin: user.is_admin,
      });

      const isAdminUser =
        user.groupe8_role === "admin" ||
        user.role === "admin" ||
        user.is_admin === true ||
        user.isAdmin === true;

      return isAdminUser;
    } catch (e) {
      console.error("Erreur vérification admin:", e);
      return false;
    }
  };

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    isMountedRef.current = true;

    // Vérifier si l'utilisateur est admin
    const adminStatus = checkAdminStatus();
    console.log("Résultat vérification admin:", adminStatus);
    setIsAdmin(adminStatus);

    if (!adminStatus && isMountedRef.current) {
      setError(
        "Accès refusé. Seuls les administrateurs peuvent ajouter des établissements.",
      );
    }

    return () => {
      isMountedRef.current = false;
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    if (!isMountedRef.current || isClosing) return;

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (!isMountedRef.current || isClosing) return;

    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
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
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isMountedRef.current || isClosing) {
      e.stopPropagation();
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("🔐 Vérification des permissions...");

      const etablissementData = {
        nom: formData.nom.trim(),
        type: formData.type,
        adresse: formData.adresse.trim(),
        telephone: formData.telephone.trim() || null,
        description: formData.description.trim() || null,
      };

      console.log("📦 Données envoyées:", etablissementData);

      const response = await api.post(
        "/groupe-8/admin/etablissements",
        etablissementData,
      );

      console.log("✅ Réponse création:", response.data);

      const etablissementId = response.data.id || response.data.data?.id;

      // Upload de l'image si fournie
      if (etablissementId && image && isMountedRef.current) {
        try {
          const formDataImage = new FormData();
          formDataImage.append("image", image);

          await api.post(
            `/groupe-8/etablissements/${etablissementId}/images`,
            formDataImage,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );
          console.log("✅ Image uploadée avec succès");
        } catch (imageError) {
          console.warn("⚠️ Erreur image:", imageError.message);
          // Ne pas bloquer le succès principal
        }
      }

      if (isMountedRef.current) {
        setSuccess("Établissement créé avec succès !");

        setTimeout(() => {
          if (isMountedRef.current) {
            closeModal();
          }
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Erreur complète:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      if (!isMountedRef.current) return;

      if (error.response?.status === 403) {
        setError(
          `Permission refusée. Raisons possibles : compte non administrateur, token expiré ou permissions manquantes. Rôle : ${isAdmin ? "Admin" : "Non-admin"}. Token : ${localStorage.getItem("token") ? "Présent" : "Absent"}.`,
        );

        // Proposer de se reconnecter
        setTimeout(() => {
          if (confirm("Voulez-vous vous reconnecter ?")) {
            localStorage.clear();
            window.location.href = "/login";
          }
        }, 1000);
      } else if (error.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 2000);
      } else if (error.message === "Permission administrateur requise") {
        setError("Permission administrateur requise. Vérifiez votre rôle.");
      } else {
        setError(error.response?.data?.message || "Erreur lors de la création");
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
        navigate("/");
      }
    }, 300);
  }, [isClosing, navigate]);

  // Gestionnaire d'événement pour Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (
        e.key === "Escape" &&
        isMountedRef.current &&
        !isClosing &&
        !loading
      ) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey, true);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey, true);
    };
  }, [isClosing, loading, closeModal]);

  if (isClosing) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden opacity-0 scale-95 transition-all duration-300" />
      </div>
    );
  }

  return (
    <Modal
      open={true}
      onClose={closeModal}
      title={
        <div className="flex items-center gap-2">
          <HiShieldCheck className="w-6 h-6 text-emerald-500" />
          Ajouter un établissement (Admin)
        </div>
      }
      ariaLabel="Ajouter un établissement (Admin)"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[scale-in_0.35s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {success && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
              <HiCheck className="w-5 h-5 flex-shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium">
              <HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line text-sm">
                {error.split("\n").map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold">
                <HiShieldCheck className="w-4 h-4" />
                Mode Administrateur
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nom"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  disabled={loading || isClosing}
                  placeholder="Nom de l'établissement"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={loading || isClosing}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base"
                >
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="adresse"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Adresse *
              </label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
                disabled={loading || isClosing}
                placeholder="Adresse complète"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base"
              />
            </div>
            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                disabled={loading || isClosing}
                placeholder="0123456789"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={loading || isClosing}
                placeholder="Description de l'établissement..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-y min-h-[100px] text-base"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Image
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading || isClosing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-w-[200px] max-h-[200px] rounded-xl shadow-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!isClosing && isMountedRef.current) {
                          setImage(null);
                          setImagePreview(null);
                        }
                      }}
                      disabled={loading || isClosing}
                      aria-label="Supprimer l'image"
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 z-20"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                    <HiPhotograph className="w-12 h-12 opacity-60" />
                    <span className="font-medium">
                      Cliquez pour télécharger une image
                    </span>
                    <span className="text-sm opacity-70">
                      PNG, JPG, JPEG - Max 5MB
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || isClosing}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <HiPlus className="w-5 h-5" />
                    Créer l'établissement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading || isClosing}
                className="flex-1 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
              >
                Annuler
              </button>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              * Champs obligatoires
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default Addetabs;
