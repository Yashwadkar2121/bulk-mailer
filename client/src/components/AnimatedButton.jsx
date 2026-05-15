import React from "react";
import { motion } from "framer-motion";

export const AnimatedButton = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40",
    secondary: "border border-pink-500/30 text-pink-400 hover:bg-pink-500/10",
    ghost: "text-slate-400 hover:text-pink-400 hover:bg-pink-500/5",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-xl px-5 py-2.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className} ${(disabled || loading) && "opacity-60 cursor-not-allowed"}`}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
};
