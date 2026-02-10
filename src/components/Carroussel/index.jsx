import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import img1 from "../../assets/images/img1.jpeg";
import img2 from "../../assets/images/img2.jpeg";
import img3 from "../../assets/images/img3.jpeg";

function Carousel() {
  const slides = useMemo(() => ([
    {
      img: img1,
      title: "Hôtels & Restaurants",
      subtitle: "Compare, note, et découvre des lieux fiables.",
    },
    {
      img: img2,
      title: "Des avis réels",
      subtitle: "Basés sur l’expérience de la communauté.",
    },
    {
      img: img3,
      title: "Trouve ton prochain séjour",
      subtitle: "En quelques clics, sans prise de tête.",
    },
  ]), []);

  const [index, setIndex] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour >= 18 ? "Bonsoir" : "Salut !";

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const navigate = useNavigate();
  const isLoggingIn = !!localStorage.getItem("token");
  const ctaHref = isLoggingIn ? "/add-etabs" : "/etablissements";
  const ctaLabel = isLoggingIn
    ? "Ajouter un établissement"
    : "Découvrir les établissements";

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-36 sm:px-6 md:grid-cols-2">
      <div data-reveal className="space-y-6 text-center md:text-left reveal-fade-left">
        <div className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-700">
          Séjours • Avis • Confiance
        </div>

        <h1 className="text-4xl font-semibold text-ink-900 md:text-5xl dark:text-white">{greeting}</h1>
        <h2 className="text-4xl font-semibold text-ink-900 md:text-5xl">
          Bienvenue sur <br />
          <span className="text-gradient animate-shimmer">Reviews</span>
        </h2>

        <p className="text-base leading-relaxed text-ink-700 dark:text-white/80">
          Une plateforme dédiée à la comparaison d’hôtels et de restaurants,
          basée sur des expériences réelles partagées par la communauté.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
          <Link to={ctaHref}>
            <button
              className="rounded-full bg-ink-700 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-ink-800 hover:shadow-[0_10px_40px_rgba(79,70,229,0.35)]"
              onClick={() => navigate(ctaHref)}
            >
              {ctaLabel}
            </button>
          </Link>
          <span className="text-xs text-ink-500">
            Utilise les flèches ou les points pour changer de slide.
          </span>
        </div>
      </div>

      <div data-reveal data-reveal-delay="120ms" className="space-y-4 reveal-fade-right">
        <div className="glass-card relative mx-auto w-full max-w-md overflow-hidden rounded-3xl p-3 animate-glowPulse md:max-w-none">
          <img
            src={slides[index].img}
            alt={slides[index].title}
            className="h-80 w-full rounded-2xl object-cover md:h-96"
          />

          <div className="glass-soft absolute inset-x-6 bottom-6 rounded-2xl px-4 py-3">
            <div className="text-sm font-semibold text-ink-800">{slides[index].title}</div>
            <div className="text-xs text-ink-600">{slides[index].subtitle}</div>
          </div>

          <div className="absolute inset-y-0 left-4 flex items-center">
            <button
              className="glass-soft h-10 w-10 rounded-full text-lg font-semibold text-ink-700 hover:bg-white/50"
              onClick={prev}
              aria-label="Précédent"
            >
              ‹
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center">
            <button
              className="glass-soft h-10 w-10 rounded-full text-lg font-semibold text-ink-700 hover:bg-white/50"
              onClick={next}
              aria-label="Suivant"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index ? "bg-ink-700" : "bg-white/50"
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Aller à la slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Carousel;
