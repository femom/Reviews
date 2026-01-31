import React from "react";
import PropTypes from "prop-types";

/** Simple badge component for small inline labels */
const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold";
  const variants = {
    default: "bg-white/10 text-white/90 dark:bg-slate-800/60",
    subtle: "bg-white/5 text-slate-300 dark:bg-slate-800/50",
    success: "bg-emerald-600 text-white",
    warning: "bg-yellow-400 text-black",
  };
  return (
    <span
      className={`${base} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["default", "subtle", "success", "warning"]),
  className: PropTypes.string,
};

export default Badge;
