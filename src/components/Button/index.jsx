import React from "react";

function Button({ contenu, color = "default", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    bleu:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus:ring-emerald-500",
    default:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500",
  };
  const styles = variants[color] || variants.default;

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {contenu}
    </button>
  );
}

export default Button;
