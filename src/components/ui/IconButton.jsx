import React from "react";
import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";

const IconButton = ({
  icon: Icon,
  label,
  className = "",
  onClick,
  children,
  ...props
}) => (
  <Motion.button
    whileTap={{ scale: 0.95 }}
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm text-slate-800 dark:text-white ${className}`}
    {...props}
  >
    {Icon ? <Icon className="w-5 h-5" /> : children}
  </Motion.button>
);

IconButton.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default IconButton;
