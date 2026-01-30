import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../NavBar/index.jsx";
import api from "../../services/api.js";
import Footer from "../../footer/index.jsx";
import Carousel from "../../Carroussel";
import { HiStar, HiLocationMarker, HiExclamationCircle, HiArrowRight } from "react-icons/hi";

import img1 from "../../../assets/images/pexels-fotoaibe-1571459.jpg";
import img2 from "../../../assets/images/pexels-falling4utah-1080721.jpg";
import img3 from "../../../assets/images/pexels-pixabay-259580.jpg";
import img4 from "../../../assets/images/pexels-jworks1124-342800.jpg";
import img5 from "../../../assets/images/pexels-fotoaibe-1643383.jpg";
import img6 from "../../../assets/images/pexels-pixabay-262047.jpg";
import img7 from "../../../assets/images/pexels-pixabay-259580.jpg";
import img8 from "../../../assets/images/pexels-vika-glitter-392079-1648776.jpg";
import img9 from "../../../assets/images/pexels-fotoaibe-1571461.jpg";

const imagePool = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

const Home = () => {
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("https://api.react.nos-apps.com/api/groupe-8/etablissements")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setEtablissements(response.data);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          setEtablissements(response.data.data);
        } else {
          setEtablissements([]);
          setError("Format de données inattendu");
        }
      })
      .catch(() => {
        setError("Impossible de charger les établissements");
        setEtablissements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const etabsWithImages = useMemo(() => {
    if (!Array.isArray(etablissements)) return [];
    return etablissements.map((etab, index) => ({
      ...etab,
      id: etab.id || etab._id || `etab-${index}`,
      nom: etab.nom || etab.name || "Établissement sans nom",
      description: etab.description || etab.desc || "",
      adresse: etab.adresse || etab.address || etab.location || "",
      note: etab.note ?? etab.rating ?? etab.moyenne ?? 3.5,
      image: imagePool[index % imagePool.length],
    }));
  }, [etablissements]);

  const displayedEtabs = showAll ? etabsWithImages : etabsWithImages.slice(0, 6);
  const hasMoreEtabs = etabsWithImages.length > 6;

  return (
    <>
      <NavBar />
      <Carousel />
      <div className="min-h-screen w-full overflow-x-hidden px-4 md:px-6 pb-12">
        <div className="max-w-6xl mx-auto py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center mb-8">
            Établissements
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Chargement des établissements...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-12 px-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <HiExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : etabsWithImages.length === 0 ? (
            <div className="text-center py-16 text-slate-600 dark:text-slate-400">
              Aucun établissement disponible pour le moment.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayedEtabs.map((etab, i) => (
                  <article
                    key={etab.id}
                    onClick={() => navigate(`/details/${etab.id}`)}
                    className="group relative h-[340px] md:h-[360px] rounded-2xl overflow-hidden bg-cover bg-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-[fade-in_0.4s_ease-out]"
                    style={{ backgroundImage: `url(${etab.image})`, animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-amber-600 font-semibold text-sm">
                      <HiStar className="w-4 h-4" />
                      {typeof etab.note === "number" ? etab.note.toFixed(1) : "3.5"}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                      <h3 className="text-xl font-bold mb-1 line-clamp-1">{etab.nom}</h3>
                      {etab.description && (
                        <p className="text-sm opacity-90 line-clamp-2 mb-2">
                          {etab.description.length > 100 ? `${etab.description.slice(0, 100)}...` : etab.description}
                        </p>
                      )}
                      {etab.adresse && (
                        <span className="flex items-center gap-1.5 text-sm opacity-80">
                          <HiLocationMarker className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{etab.adresse}</span>
                        </span>
                      )}
                      <Link
                        to={`/details/${etab.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 mt-3 text-emerald-300 hover:text-emerald-200 font-semibold text-sm transition-colors"
                      >
                        Voir les détails
                        <HiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
                <Link
                  to="/etablissements"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-200"
                >
                  Voir tous les établissements ({etabsWithImages.length})
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
