import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiAlertTriangle, FiMapPin, FiArrowUp, FiStar, FiArrowRight } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

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
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop"
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

        console.log(`📋 Favoris de l'utilisateur: ${userFavorites.length} établissements`);
        
        // Récupérer tous les établissements
        const response = await api.get("/groupe-8/etablissements");
        console.log("✅ Données API reçues:", response.data);
        
        // Gestion de la réponse selon la structure
        let allEtablissements;
        if (response.data && Array.isArray(response.data)) {
          allEtablissements = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          allEtablissements = response.data.data;
        } else if (response.data && response.data.etablissements && Array.isArray(response.data.etablissements)) {
          allEtablissements = response.data.etablissements;
        } else {
          allEtablissements = [];
        }
        
        // Filtrer pour ne garder que les favoris
        const favoriteEtabs = allEtablissements.filter(etab => 
          userFavorites.includes(etab.id) || 
          userFavorites.includes(etab.id?.toString())
        );
        
        console.log(`⭐ Établissements favoris trouvés: ${favoriteEtabs.length}`);
        
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
          image: etab.image || etabImages[index % etabImages.length]
        }));
        
        setEtablissements(etabsWithImages);
        
      } catch (err) {
        console.error("❌ Erreur lors du chargement des favoris:", err);
        setError("Impossible de charger vos établissements favoris. Veuillez réessayer.");
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
    
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500 dark:text-white/60">Collection</p>
          <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl dark:text-white">Mes Favoris</h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-white/80">
            Retrouvez ici tous les établissements que vous avez aimés.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-white/40 px-4 py-2 text-sm font-medium text-ink-700 md:flex dark:bg-slate-900/50 dark:text-white/80">
          <FaHeart className="text-rose-500" />
          {etablissements.length} favoris
        </div>
      </div>

      {error && (
        <div className="glass-panel mb-6 flex items-center gap-2 rounded-2xl px-5 py-4 text-sm text-rose-600 dark:text-rose-200">
          <FiAlertTriangle />
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-6 py-5 text-ink-700 dark:text-white/80">
          <div className="h-3 w-3 animate-pulse rounded-full bg-ink-500" />
          <p>Chargement de vos favoris...</p>
        </div>
      ) : etablissements.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center text-ink-900 dark:text-white">
          <div className="glass-soft inline-flex h-14 w-14 items-center justify-center rounded-full text-rose-500">
            <FaHeart />
          </div>
          <h3 className="text-lg font-semibold">Aucun favori pour le moment</h3>
          <p className="text-sm text-ink-600 dark:text-white/80">
            Vous n'avez pas encore ajouté d'établissement à vos favoris. Parcourez nos établissements
            et ajoutez vos préférés.
          </p>
          <button
            onClick={() => navigate("/etablissements")}
            className="rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white"
          >
            Explorer les établissements
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-ink-600 dark:text-white/80">
              <span className="font-semibold text-ink-800 dark:text-white">{etablissements.length}</span>{" "}
              établissement{etablissements.length > 1 ? "s" : ""} en favoris
            </div>
          </div>

          <div data-reveal-section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {etablissements.map((etab, index) => {
              const currentRating = etab.note || etab.moyenne || etab.rating || 3.5;

              return (
                <div
                  className={`group relative overflow-hidden rounded-3xl bg-white/20 shadow-glass transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(79,70,229,0.25)] h-full ${
                    index % 2 === 0 ? "reveal-fade-left" : "reveal-fade-right"
                  }`}
                  data-reveal
                  data-reveal-delay={`${Math.min(400, index * 60)}ms`}
                  key={etab.id || `etab-${index}`}
                  style={{
                    backgroundImage: `url(${etab.image || etabImages[index % etabImages.length]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-800">
                    <FiStar className="text-amber-500" />
                    {typeof currentRating === "number" ? currentRating.toFixed(1) : "3.5"}
                  </div>

                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white">
                    <FaHeart />
                    Favori
                  </div>

                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/45 px-4 py-3 text-white backdrop-blur-xl dark:bg-slate-900/60">
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

                    <Link
                      to={`/details/${etab.id}`}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Voir les détails <FiArrowRight />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 glass-panel rounded-2xl px-6 py-5 text-sm text-ink-600 dark:text-white/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-amber-500" />
                <p>
                  Astuce : vous pouvez retirer un établissement de vos favoris en cliquant
                  à nouveau sur le cœur dans la page des détails.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/etablissements")}
                  className="rounded-full bg-white/60 px-5 py-2 text-xs font-semibold text-ink-700 hover:bg-white/80"
                >
                  Voir plus d'établissements
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-700 px-5 py-2 text-xs font-semibold text-white"
                >
                  <FiArrowUp />
                  Retour en haut
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Favoris;
