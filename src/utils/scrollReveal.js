// Initialisation d'un IntersectionObserver pour révéler les éléments lors du scroll.
// Cible par défaut : éléments avec l'attribut `data-reveal` ou les sélecteurs `.reveal`, `.glass-panel`, `.group`.

const defaultSelector = '[data-reveal]';

export default function initScrollReveal({ selector = defaultSelector, rootMargin = '0px 0px -10% 0px', threshold = 0.12 } = {}) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return; // éviter les animations pour les utilisateurs sensibles

  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) return;

  // add base class immediately so the element is hidden before paint
  elements.forEach((el) => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  let seq = 0;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // reset stagger when a new section starts
        if (el.hasAttribute('data-reveal-section')) {
          seq = 0;
        }
        // compute delay: use data-delay or incremental sequence to create nice stagger
        const dataDelay = el.getAttribute('data-reveal-delay');
        const delay = dataDelay ? dataDelay : `${Math.min(360, seq * 50)}ms`;
        el.style.setProperty('--reveal-delay', delay);
        // force repaint then add visible class
        requestAnimationFrame(() => {
          el.classList.add('reveal--visible');
        });
        obs.unobserve(el);
        seq += 1;
      }
    });
  }, { root: null, rootMargin, threshold });

  elements.forEach((el) => observer.observe(el));

  // return teardown function
  return () => observer.disconnect();
}
