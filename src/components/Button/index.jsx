import React from "react";

function Button({ contenu, color = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    bleu: "btn-primary",
    default:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500",
    ghost: "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-white/3",
  };
  const styles = variants[color] || variants.default;

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {contenu}
    </button>
  );
}

export default Button;
