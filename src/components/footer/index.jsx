import { Link, useNavigate } from "react-router-dom";
import { HiUser, HiUserGroup, HiOfficeBuilding, HiHeart } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { Surface } from "../ui";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-[#080c14] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-3">
              Reviews<span className="text-emerald-500">.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
              L&apos;excellence au service de vos choix. Découvrez les
              meilleures adresses du Congo.
            </p>
            <div className="flex gap-2 mt-5">
              <a
                href="#"
                aria-label="Facebook"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold mb-5 opacity-90">
              Exploration
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/Team"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <HiUserGroup className="w-4 h-4 flex-shrink-0" />
                  Notre Équipe
                </Link>
              </li>
              <li>
                <Link
                  to="/etablissements?type=hotel"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <HiOfficeBuilding className="w-4 h-4 flex-shrink-0" />
                  Hôtels
                </Link>
              </li>
              <li>
                <Link
                  to="/etablissements?type=restaurant"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <HiHeart className="w-4 h-4 flex-shrink-0" />
                  Mes Favoris
                </Link>
              </li>
            </ul>
          </div>

          <Surface className="rounded-2xl border border-white/5 bg-white/5 p-6 flex flex-col justify-center">
            <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold mb-3 opacity-90">
              Espace Membre
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Connectez-vous pour partager votre expérience.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <HiUser className="w-4 h-4" />
              Se connecter
            </button>
          </Surface>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider">
            &copy; {new Date().getFullYear()} REVIEWS — TOUS DROITS RÉSERVÉS
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-slate-500 hover:text-emerald-500 text-xs transition-colors"
            >
              Confidentialité
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-emerald-500 text-xs transition-colors"
            >
              Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
