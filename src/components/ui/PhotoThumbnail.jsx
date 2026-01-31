import React from "react";
import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";

/**
 * PhotoThumbnail
 * - src, alt
 * - isActive: highlight
 * - isFallback: show indicator
 */
const PhotoThumbnail = ({
  src,
  alt,
  isActive,
  isFallback,
  onClick,
  className = "",
}) => {
  return (
    <Motion.button
      onClick={onClick}
      className={`thumbnail relative overflow-hidden rounded-lg border-2 ${isActive ? "border-emerald-500 scale-105 z-20" : "border-transparent"} ${className}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      type="button"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="w-20 h-14 object-cover block"
        onError={(e) => {
          e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='140'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'>No image</text></svg>`;
          e.target.onerror = null;
        }}
      />
      {isFallback && (
        <div className="absolute inset-0 flex items-start justify-end p-1 pointer-events-none">
          <span className="bg-yellow-400 text-xs rounded px-1 py-0.5 text-black">
            ⚠️
          </span>
        </div>
      )}
    </Motion.button>
  );
};

PhotoThumbnail.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  isActive: PropTypes.bool,
  isFallback: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default PhotoThumbnail;
