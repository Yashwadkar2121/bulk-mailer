import React from "react";
import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = true, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`relative rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-6 ${className}`}
      {...props}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-t-2xl" />
      {children}
    </motion.div>
  );
};
