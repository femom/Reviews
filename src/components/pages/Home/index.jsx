import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import Footer from "../../footer/index.jsx";
import Carousel from "../../Carroussel";
import {
  FiAlertTriangle,
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiGrid,
  FiTrendingUp,
  FiMessageSquare,
  FiShield,
  FiCheckCircle,
  FiPlusCircle,
  FiNavigation,
} from "react-icons/fi";
import { logger } from "../../../utils/logger.js";

// Images locales pour illustrer les établissements
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
        logger.info("Home data received");
        // Vérifier différentes structures de réponse
        if (response.data && Array.isArray(response.data)) {
          setEtablissements(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setEtablissements(response.data.data);
        } else {
          setEtablissements([]);
          setError("Format de données inattendu");
        }
      })
      .catch((err) => {
        logger.error("Home API error:", err);
        setError("Impossible de charger les établissements");
        setEtablissements([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const etabsWithImages = useMemo(() => {
    if (!Array.isArray(etablissements)) return [];
    return etablissements.map((etab, index) => ({
      ...etab,
      id: etab.id || etab._id || `etab-${index}`,
      nom: etab.nom || etab.name || "Établissement sans nom",
      description: etab.description || etab.desc || "",
      adresse: etab.adresse || etab.address || etab.location || "",
      note: etab.note || etab.rating || etab.moyenne || 3.5,
      image: imagePool[index % imagePool.length],
    }));
  }, [etablissements]);

  // Limiter à 6 cartes maximum sur la page d'accueil
  const displayedEtabs = showAll ? etabsWithImages : etabsWithImages.slice(0, 6);
  const hasMoreEtabs = etabsWithImages.length > 6;
  const topRated = useMemo(() => {
    return [...etabsWithImages].sort((a, b) => (b.note || 0) - (a.note || 0)).slice(0, 5);
  }, [etabsWithImages]);
  const nearYou = useMemo(() => etabsWithImages.slice(0, 4), [etabsWithImages]);
  const latestReviews = useMemo(() => {
    return etabsWithImages.slice(0, 3).map((etab, index) => ({
      id: `${etab.id}-review-${index}`,
      etab,
      author: ["Aya", "Marc", "Junior"][index % 3],
      note: Math.max(3, Math.round(etab.note || 4)),
      text: etab.description
        ? etab.description.substring(0, 90) + (etab.description.length > 90 ? "..." : "")
        : "Très bonne expérience, service attentif et ambiance agréable.",
    }));
  }, [etabsWithImages]);
  const buildSpark = (values) => {
    const safe = values.length ? values : [1, 1, 1, 1, 1, 1];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const range = max - min || 1;
    const w = 54;
    const h = 18;
    const p = 2;
    const step = safe.length > 1 ? (w - p * 2) / (safe.length - 1) : 0;
    return safe
      .map((v, i) => {
        const x = p + i * step;
        const y = h - p - ((v - min) / range) * (h - p * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };
  const categoryCounts = useMemo(() => {
    const counts = {};
    etabsWithImages.forEach((e) => {
      const t = (e.type || "").toString().toLowerCase();
      if (t.includes("hotel")) counts.hotel = (counts.hotel || 0) + 1;
      else if (t.includes("restaurant")) counts.restaurant = (counts.restaurant || 0) + 1;
      else if (t.includes("bar")) counts.bar = (counts.bar || 0) + 1;
      else if (t.includes("café") || t.includes("cafe")) counts.cafe = (counts.cafe || 0) + 1;
      else if (t.includes("musée") || t.includes("musee")) counts.musee = (counts.musee || 0) + 1;
      else if (t.includes("parc")) counts.parc = (counts.parc || 0) + 1;
    });
    return counts;
  }, [etabsWithImages]);
  const categories = [
    { label: "Hôtels", type: "hotel" },
    { label: "Restaurants", type: "restaurant" },
    { label: "Bars", type: "bar" },
    { label: "Cafés", type: "cafe" },
    { label: "Musées", type: "musee" },
    { label: "Parcs", type: "parc" },
  ];
  const availableCategories = useMemo(() => {
    return categories.filter((cat) => (categoryCounts[cat.type] || 0) > 0);
  }, [categories, categoryCounts]);
  const stats = useMemo(() => {
    const total = etabsWithImages.length;
    const avg = total
      ? (
          etabsWithImages.reduce((acc, e) => acc + (e.note || 0), 0) / total
        ).toFixed(1)
      : "0.0";
    const ratingsSeries = etabsWithImages.slice(0, 6).map((e) => e.note || 3.5);
    const categorySeries = categories.map((c) => categoryCounts[c.type] || 0).slice(0, 6);
    const totalSeries = etabsWithImages.slice(0, 6).map((e, i) => (e.note || 3) + (i % 2 ? 0.2 : -0.1));
    return [
      {
        label: "Établissements",
        value: total,
        icon: <FiGrid />,
        spark: buildSpark(totalSeries),
      },
      {
        label: "Catégories actives",
        value: availableCategories.length,
        icon: <FiCheckCircle />,
        spark: buildSpark(categorySeries),
      },
      {
        label: "Note moyenne",
        value: avg,
        icon: <FiStar />,
        spark: buildSpark(ratingsSeries),
      },
    ];
  }, [etabsWithImages, availableCategories.length, categoryCounts, categories]);
  const nouveautes = useMemo(() => {
    return etabsWithImages.slice(0, 5);
  }, [etabsWithImages]);

  return (
    <>
      <Carousel />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        {/* Categories */}
        <section data-reveal data-reveal-section className="mb-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Explorer</p>
              <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Catégories</h2>
            </div>
            <FiGrid className="text-ink-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {(availableCategories.length ? availableCategories : categories).map((cat, index) => (
              <Link
                key={cat.type}
                to={`/etablissements?type=${cat.type}`}
                data-reveal
                data-reveal-delay={`${Math.min(320, index * 50)}ms`}
                className={`glass-soft flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold text-ink-700 transition hover:-translate-y-1 hover:bg-white/60 dark:text-white/80 h-full ${
                  index % 2 === 0 ? "reveal-fade-left" : "reveal-fade-right"
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat.label}
                  {categoryCounts[cat.type] ? (
                    <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-ink-700 dark:bg-slate-900/60 dark:text-white/70">
                      {categoryCounts[cat.type]}
                    </span>
                  ) : null}
                </span>
                <FiArrowRight />
              </Link>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section data-reveal data-reveal-section className="mb-12">
          <div className="grid gap-4 md:grid-cols-3 items-stretch">
            {stats.map((item, index) => (
              <div
                key={item.label}
                data-reveal
                data-reveal-delay={`${Math.min(320, index * 60)}ms`}
                className="glass-panel rounded-2xl p-5 text-ink-900 dark:text-white h-full"
              >
                <div className="flex items-center justify-between text-ink-500 dark:text-white/60">
                  <p className="text-xs uppercase tracking-[0.3em]">{item.label}</p>
                  <span className="text-base">{item.icon}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <svg viewBox="0 0 54 18" className="sparkline h-5 w-20 text-aurora-500">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={item.spark}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div data-reveal data-reveal-section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Sélection</p>
            <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">Établissements</h1>
          </div>
          <Link
            to="/etablissements"
            className="hidden items-center gap-2 rounded-full bg-white/40 px-4 py-2 text-sm font-medium text-ink-700 transition hover:bg-white/60 md:inline-flex"
          >
            Tout voir
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
            <div className="glass-panel flex items-center gap-3 rounded-2xl px-6 py-5 text-ink-700 dark:text-white/80">
              <div className="h-3 w-3 animate-pulse rounded-full bg-ink-500" />
              <p>Chargement des établissements...</p>
            </div>
        ) : error ? (
          <div className="glass-panel flex flex-col gap-3 rounded-2xl px-6 py-5 text-ink-700 dark:text-white/80">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-200">
              <FiAlertTriangle />
              <span>{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-fit rounded-full bg-ink-700 px-4 py-2 text-xs font-semibold text-white"
            >
              Réessayer
            </button>
          </div>
        ) : etabsWithImages.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-8 text-ink-600 dark:text-white/80">
            Aucun établissement disponible pour le moment.
          </div>
        ) : (
          <>
            <div data-reveal-section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {displayedEtabs.map((etab, index) => (
                <div
                  data-reveal
                  data-reveal-delay={`${Math.min(400, index * 60)}ms`}
                  className="group relative overflow-hidden rounded-3xl bg-white/20 shadow-glass transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(79,70,229,0.25)] h-full"
                  key={etab.id}
                  onClick={() => navigate(`/details/${etab.id}`)}
                >
                  <div
                    className="h-52 w-full bg-cover bg-center sm:h-56"
                    style={{ backgroundImage: `url(${etab.image})` }}
                  />
                  <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-800">
                    <FiStar className="text-amber-500" />
                    {typeof etab.note === "number" ? etab.note.toFixed(1) : "3.5"}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/45 px-4 py-3 text-white backdrop-blur-xl dark:bg-slate-900/60">
                    <h3 className="text-sm font-semibold">{etab.nom}</h3>
                    {etab.description && (
                      <p className="mt-1 text-xs text-white/80">
                        {etab.description.length > 100
                          ? `${etab.description.substring(0, 100)}...`
                          : etab.description}
                      </p>
                    )}
                    {etab.adresse && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                        <FiMapPin />
                        <span>{etab.adresse}</span>
                      </div>
                    )}
                    {etab.id && (
                      <Link
                        to={`/details/${etab.id}`}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Voir les détails <FiArrowRight />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMoreEtabs && (
              <div className="mt-10 flex justify-center">
                <Link
                  to="/etablissements"
                  className="rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white shadow-glow"
                >
                  Voir tous les établissements ({etabsWithImages.length})
                </Link>
              </div>
            )}
          </>
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <section data-reveal data-reveal-section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Focus</p>
                <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Top notés cette semaine</h2>
              </div>
              <FiTrendingUp className="text-ink-400" />
            </div>
            <div className="relative overflow-hidden">
              <div className="marquee-track flex w-max gap-4 pr-4">
                {[...topRated, ...topRated].map((etab, index) => (
                  <div
                    key={`${etab.id}-${index}`}
                    className="glass-card min-w-[220px] sm:min-w-[240px] rounded-2xl p-4 text-ink-900 dark:text-white"
                  >
                    <div className="mb-3 h-28 w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${etab.image})` }} />
                    <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-white/70">
                      <FiStar className="text-amber-400" />
                      {typeof etab.note === "number" ? etab.note.toFixed(1) : "3.5"}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold">{etab.nom}</h3>
                    <Link
                      to={`/details/${etab.id}`}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-ink-700 hover:text-ink-900 dark:text-white/80 dark:hover:text-white"
                    >
                      Voir le lieu <FiArrowRight />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Reviews */}
        {latestReviews.length > 0 && (
          <section data-reveal data-reveal-section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Communauté</p>
                <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Derniers avis</h2>
              </div>
              <FiMessageSquare className="text-ink-400" />
            </div>
            <div className="grid gap-4 md:grid-cols-3 items-stretch">
              {latestReviews.map((review, index) => (
                <div
                  key={review.id}
                  data-reveal
                  data-reveal-delay={`${Math.min(320, index * 60)}ms`}
                  className="glass-panel rounded-2xl p-5 text-ink-900 dark:text-white h-full"
                >
                  <div className="flex items-center justify-between text-xs text-ink-600 dark:text-white/70">
                    <span>{review.author}</span>
                    <span className="inline-flex items-center gap-1">
                      <FiStar className="text-amber-400" />
                      {review.note}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink-700 dark:text-white/80">{review.text}</p>
                  <Link
                    to={`/details/${review.etab.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-ink-700 hover:text-ink-900 dark:text-white/80 dark:hover:text-white"
                  >
                    {review.etab.nom} <FiArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Why Reviews */}
        <section data-reveal data-reveal-section className="mt-16">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Confiance</p>
            <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Pourquoi Reviews ?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 items-stretch">
            {[
              { title: "Avis réels", icon: <FiCheckCircle />, text: "Des retours authentiques pour choisir en toute confiance." },
              { title: "Sélection locale", icon: <FiShield />, text: "Des adresses pertinentes et mises à jour." },
              { title: "Décision rapide", icon: <FiTrendingUp />, text: "Comparez vite grâce aux notes et détails clairs." },
            ].map((item, index) => (
              <div
                key={item.title}
                data-reveal
                data-reveal-delay={`${Math.min(320, index * 60)}ms`}
                className="glass-soft rounded-2xl p-5 text-ink-900 dark:text-white h-full"
              >
                <div className="text-ink-600 dark:text-white/70">{item.icon}</div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-white/80">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section data-reveal data-reveal-section className="mt-16">
          <div className="glass-panel flex flex-col items-start justify-between gap-4 rounded-3xl p-6 text-ink-900 dark:text-white md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-semibold">Partagez votre expérience</h3>
              <p className="mt-2 text-sm text-ink-600 dark:text-white/80">
                Ajoutez un établissement ou donnez votre avis pour aider la communauté.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/addetabs" className="inline-flex items-center gap-2 rounded-full bg-ink-700 px-5 py-2 text-sm font-semibold text-white">
                <FiPlusCircle />
                Ajouter un établissement
              </Link>
              <Link to="/etablissements" className="inline-flex items-center gap-2 rounded-full bg-white/60 px-5 py-2 text-sm font-semibold text-ink-700 hover:bg-white/80">
                Voir les avis
              </Link>
            </div>
          </div>
        </section>

        {/* Near You */}
        {nearYou.length > 0 && (
          <section data-reveal data-reveal-section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Proximité</p>
                <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Lieux près de vous</h2>
              </div>
              <FiNavigation className="text-ink-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-stretch">
              {nearYou.map((etab, index) => (
                <div
                  key={etab.id}
                  data-reveal
                  data-reveal-delay={`${Math.min(320, index * 60)}ms`}
                  className="glass-card rounded-2xl p-4 text-ink-900 dark:text-white h-full"
                >
                  <div className="h-24 w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${etab.image})` }} />
                  <h3 className="mt-3 text-sm font-semibold">{etab.nom}</h3>
                  <p className="mt-1 text-xs text-ink-600 dark:text-white/70">à 5-12 min</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nouveautés */}
        {nouveautes.length > 0 && (
          <section data-reveal data-reveal-section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Nouveautés</p>
                <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">Derniers ajouts</h2>
              </div>
              <FiTrendingUp className="text-ink-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 items-stretch">
              {nouveautes.map((etab, index) => (
                <div
                  key={etab.id}
                  data-reveal
                  data-reveal-delay={`${Math.min(320, index * 60)}ms`}
                  className="glass-soft rounded-2xl p-4 text-ink-900 dark:text-white h-full"
                >
                  <div className="h-20 w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${etab.image})` }} />
                  <h3 className="mt-3 text-sm font-semibold">{etab.nom}</h3>
                  <p className="mt-1 text-xs text-ink-600 dark:text-white/70">{etab.type || "Nouveau lieu"}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default Home;
