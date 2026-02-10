import { Link, useNavigate } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";


function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-20 px-4 pb-10 text-ink-900 dark:text-white sm:px-6">
      <div className="glass-panel mx-auto max-w-6xl rounded-3xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">
              Reviews<span className="text-ink-500">.</span>
            </h2>
            <p className="text-sm text-ink-700 dark:text-white/80">
              L'excellence au service de vos choix. Découvrez les meilleures adresses du Congo.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="glass-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:bg-white/60 dark:text-white/80">
                <FaFacebookF />
              </a>
              <a href="#" className="glass-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:bg-white/60 dark:text-white/80">
                <FaInstagram />
              </a>
              <a href="#" className="glass-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:bg-white/60 dark:text-white/80">
                <FaXTwitter />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-600 dark:text-white/70">Exploration</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-700 dark:text-white/80">
              <li><Link to="/Team" className="hover:text-ink-900 dark:hover:text-white">Notre Équipe</Link></li>
              <li><Link to="/etablissements?type=hotel" className="hover:text-ink-900 dark:hover:text-white">Hôtels</Link></li>
              <li><Link to="/etablissements?type=restaurant" className="hover:text-ink-900 dark:hover:text-white">Restaurants</Link></li>
              <li><Link to="/favorites" className="hover:text-ink-900 dark:hover:text-white">Mes Favoris</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-600 dark:text-white/70">Espace Membre</h3>
            <p className="mt-4 text-sm text-ink-700 dark:text-white/80">Connectez-vous pour partager votre expérience.</p>
            <button
              className="mt-4 rounded-full bg-ink-700 px-5 py-2 text-sm font-semibold text-white"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </button>
          </div>
        </div>

        <div className="mt-10 border-t border-white/30 pt-6 text-xs text-ink-600 dark:text-white/60 md:flex md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} REVIEWS — TOUS DROITS RÉSERVÉS</p>
          <div className="mt-3 flex items-center gap-3 md:mt-0">
            <a href="#" className="hover:text-ink-800 dark:hover:text-white">Confidentialité</a>
            <span>•</span>
            <a href="#" className="hover:text-ink-800 dark:hover:text-white">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
