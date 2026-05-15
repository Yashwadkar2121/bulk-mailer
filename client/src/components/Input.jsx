import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Input = ({
  label,
  icon: Icon,
  error,
  success,
  helper,
  className = "",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
            ${focused ? "text-pink-400" : error ? "text-red-400" : success ? "text-green-400" : "text-slate-500"}`}
          />
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-xl bg-slate-800/50 border text-slate-200 placeholder-slate-500 focus:outline-none transition-all
            ${Icon ? "pl-10" : "px-4"} pr-4 py-3
            ${focused ? "border-pink-500/50 ring-2 ring-pink-500/20" : error ? "border-red-500/50" : success ? "border-green-500/50" : "border-pink-500/20"}
            ${className}`}
          {...props}
        />
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {error && <span className="text-red-400 text-xs">⚠️</span>}
              {success && <span className="text-green-400 text-xs">✓</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {(error || helper) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs mt-1 ${error ? "text-red-400" : "text-slate-500"}`}
        >
          {error || helper}
        </motion.p>
      )}
    </motion.div>
  );
};
