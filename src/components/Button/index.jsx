import React from "react";

function Button({ contenu, color, className = "", ...props }) {
  const style = color ? { color } : undefined;
  return (
    <button
      style={style}
      className={`px-4 py-2 rounded-full text-sm font-medium bg-ink-600/90 text-white hover:bg-ink-700 transition ${className}`}
      {...props}
    >
      {contenu}
    </button>
  );
}

export default Button;
