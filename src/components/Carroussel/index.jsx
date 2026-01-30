import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
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
  const greeting = hour < 12 ? "Bonjour" : hour >= 18 ? "Bonsoir" : "Salut";

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

    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
      <div className="pt-[72px] lg:pt-0 flex flex-col">
        <span className="inline-flex w-fit px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-4">
          Séjours • Avis • Confiance
        </span>
        <h1 className="text-4xl md:text-5xl font-medium text-slate-500 dark:text-slate-400 mb-2">{greeting}</h1>
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          Bienvenue sur <span className="text-emerald-600">Reviews</span>
        </h2>


        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
          Une plateforme dédiée à la comparaison d’hôtels et de restaurants,
          basée sur des expériences réelles partagées par la communauté.
        </p>

        <div className="flex flex-col gap-3">
          <Link to={ctaHref}>
            <button type="button" onClick={() => navigate(ctaHref)} className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-base uppercase tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              {ctaLabel}
            </button>
          </Link>
          <span className="text-sm text-slate-500 dark:text-slate-400 italic">
            Utilisez les flèches ou les points pour changer de slide.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative rounded-3xl overflow-hidden h-[320px] md:h-[400px] lg:h-[420px] shadow-2xl shadow-slate-200/50 dark:shadow-black/30 bg-slate-100 dark:bg-slate-800">
          <img src={slides[index].img} alt={slides[index].title} className="w-full h-full object-cover transition-transform duration-700 ease-out" />
          <div className="absolute inset-x-0 bottom-0 pt-20 pb-8 px-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <div className="text-xl font-bold mb-1">{slides[index].title}</div>
            <div className="text-sm opacity-90">{slides[index].subtitle}</div>
          </div>
          <button type="button" onClick={prev} aria-label="Précédent" className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-800 dark:text-white shadow-lg hover:scale-110 transition-transform duration-200">
            <HiChevronLeft className="w-6 h-6" />
          </button>
          <button type="button" onClick={next} aria-label="Suivant" className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-800 dark:text-white shadow-lg hover:scale-110 transition-transform duration-200">
            <HiChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-emerald-500" : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Carousel;
