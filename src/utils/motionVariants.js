// Shared Framer Motion variants used across the app
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

export const pageTransition = { duration: 0.28, ease: [0.2, 0.9, 0.2, 1] };

export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const overlayVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInLeft = {
  initial: { x: "-6%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-6%", opacity: 0 },
};

export const pop = {
  initial: { scale: 0.98, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.98, opacity: 0 },
};

// Thumbnails / list helpers
export const thumbnailsList = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
  exit: {},
};

export const thumbnailItem = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};
