import React from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import PropTypes from "prop-types";
import { overlayVariant, pop } from "../../utils/motionVariants";

const Modal = ({ open, onClose, title, children, ariaLabel = "Modal" }) => {
  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[1200] flex items-center justify-center"
          variants={overlayVariant}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        >
          <Motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />

          <Motion.div
            role="dialog"
            aria-label={ariaLabel}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 shadow-soft-strong"
          >
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <div>{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  ariaLabel: PropTypes.string,
};

export default Modal;
