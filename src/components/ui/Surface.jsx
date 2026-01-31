import React from "react";
import PropTypes from "prop-types";

/**
 * Surface component - wrapper for glass surfaces
 * Usage: <Surface className="p-4">...</Surface>
 */
const Surface = ({ children, className = "", ...props }) => (
  <div className={`component-surface p-4 ${className}`} {...props}>
    {children}
  </div>
);

Surface.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Surface;
