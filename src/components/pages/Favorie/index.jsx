import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  HiHeart,
  HiLocationMarker,
  HiExclamationCircle,
  HiArrowRight,
  HiStar,
} from "react-icons/hi";
import { motion as Motion } from "framer-motion";
import { fadeInUp, pop } from "../../../utils/motionVariants";
import { Card } from "../../ui";

function Favoris() {
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favorites } = useAuth();
  const navigate = useNavigate();

  // Images par défaut pour les établissements
  const etabImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
  ];

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Chargement des favoris...");

        // Vérifier si l'utilisateur a des favoris
        const userFavorites = Array.isArray(favorites) ? favorites : [];

        if (userFavorites.length === 0) {
          console.log("ℹ️ Aucun favori trouvé");
          setEtablissements([]);
          setLoading(false);
          return;
        }

        console.log(
          `📋 Favoris de l'utilisateur: ${userFavorites.length} établissements`,
        );

        // Récupérer tous les établissements
        const response = await api.get("/groupe-8/etablissements");
        console.log("✅ Données API reçues:", response.data);

        // Gestion de la réponse selon la structure
        let allEtablissements;
        if (response.data && Array.isArray(response.data)) {
          allEtablissements = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          allEtablissements = response.data.data;
        } else if (
          response.data &&
          response.data.etablissements &&
          Array.isArray(response.data.etablissements)
        ) {
          allEtablissements = response.data.etablissements;
        } else {
          allEtablissements = [];
        }

        // Filtrer pour ne garder que les favoris
        const favoriteEtabs = allEtablissements.filter(
          (etab) =>
            userFavorites.includes(etab.id) ||
            userFavorites.includes(etab.id?.toString()),
        );

        console.log(
          `⭐ Établissements favoris trouvés: ${favoriteEtabs.length}`,
        );

        // Ajouter des images aux établissements
        const etabsWithImages = favoriteEtabs.map((etab, index) => ({
          ...etab,
          id: etab.id || etab._id || `etab-${index}`,
          nom: etab.nom || etab.name || "Établissement sans nom",
          type: etab.type || etab.categorie || "Non spécifié",
          description: etab.description || etab.desc || "",
          adresse: etab.adresse || etab.address || etab.location || "",
          note: etab.note || etab.moyenne || etab.rating || 3.5,
          moyenne: etab.moyenne || etab.rating || etab.note || 3.5,
          image: etab.image || etabImages[index % etabImages.length],
        }));

        setEtablissements(etabsWithImages);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des favoris:", err);
        setError(
          "Impossible de charger vos établissements favoris. Veuillez réessayer.",
        );
        setEtablissements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  // Fonction pour gérer les erreurs d'image
  const handleImageError = (e, index) => {
    console.warn("Image failed to load, using fallback");
    const fallbackIndex = index % etabImages.length;
    e.target.src = etabImages[fallbackIndex];
    e.target.onerror = null; // Empêche les boucles infinies
  };

  return (
    <Motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900"
    >
      <div className="pt-[72px] safe-top" />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            <HiHeart className="w-10 h-10 text-red-500" />
            Mes Favoris
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Retrouvez ici tous les établissements que vous avez aimés
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-8 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <HiExclamationCircle className="w-6 h-6 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">
              Chargement de vos favoris...
            </p>
          </div>
        ) : etablissements.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700">
            <HiHeart className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Vous n&apos;avez pas encore ajouté d&apos;établissement à vos
              favoris. Parcourez nos établissements et ajoutez vos préférés !
            </p>
            <button
              onClick={() => navigate("/etablissements")}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explorer les établissements
            </button>
          </div>
        ) : (
          <>
            <div className="favoris-info">
              <div className="favoris-count">
                <span className="count-number">{etablissements.length}</span>
                <span className="count-text">
                  établissement{etablissements.length > 1 ? "s" : ""} en favoris
                </span>
              </div>

              {etablissements.length > 6 && (
                <div className="sort-options">
                  <button className="sort-btn active">Tous les favoris</button>
                </div>
              )}
            </div>

            <div className="etab-grid">
              {etablissements.map((etab, index) => {
                const currentRating =
                  etab.note || etab.moyenne || etab.rating || 3.5;
                const img = etab.image || etabImages[index % etabImages.length];
                return (
                  <Card
                    key={etab.id || `etab-${index}`}
                    image={img}
                    className="h-[340px]"
                    onClick={() => navigate(`/details/${etab.id}`)}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-xs text-amber-600 font-semibold text-sm">
                      <HiStar className="w-4 h-4" />
                      {typeof currentRating === "number"
                        ? currentRating.toFixed(1)
                        : "3.5"}
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-sm font-semibold">
                      <HiHeart className="w-4 h-4" />
                      Favori
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl md:text-2xl font-extrabold mb-1 line-clamp-1">
                        {etab.nom || "Nom inconnu"}
                      </h3>
                      <p className="text-sm opacity-90 mb-2">
                        {etab.type || "Non spécifié"}
                      </p>
                      {etab.description && (
                        <p className="text-sm opacity-90 line-clamp-2 mb-2">
                          {etab.description.substring(0, 100)}
                          {etab.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                      {etab.adresse && (
                        <span className="flex items-center gap-1.5 text-sm opacity-80 mb-2">
                          <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{etab.adresse}</span>
                        </span>
                      )}
                      <Link
                        to={`/details/${etab.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 font-semibold text-sm transition-colors"
                      >
                        Voir les détails
                        <HiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                <strong>Astuce :</strong> Vous pouvez retirer un établissement
                de vos favoris en cliquant à nouveau sur le cœur dans la page
                des détails.
              </p>
              {etablissements.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate("/etablissements")}
                    className="px-6 py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    Voir plus d&apos;établissements
                  </button>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Retour en haut
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Motion.div>
  );
}

export default Favoris;
