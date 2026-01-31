import React from "react";
import { motion as Motion } from "framer-motion";
import PropTypes from "prop-types";
import { fadeInUp } from "../../utils/motionVariants";

/**
 * Card component
 * - image: background image url
 * - children: content (title, meta, actions)
 * - onClick: optional click handler (makes card keyboard accessible)
 * - className: additional Tailwind classes
 */
const Card = ({
  image,
  children,
  onClick,
  className = "",
  style = {},
  ...props
}) => {
  const isClickable = typeof onClick === "function";

  const handleKeyDown = (e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Motion.article
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={isClickable ? { translateY: -6, scale: 1.01 } : undefined}
      whileTap={isClickable ? { scale: 0.995 } : undefined}
      className={`group relative rounded-3xl overflow-hidden bg-cover bg-center ${isClickable ? "cursor-pointer" : "cursor-default"} shadow-soft-strong hover:shadow-2xl transition-transform duration-300 will-change-transform ${className}`}
      style={{ backgroundImage: image ? `url(${image})` : undefined, ...style }}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Motion.article>
  );
};

Card.propTypes = {
  image: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Card;
