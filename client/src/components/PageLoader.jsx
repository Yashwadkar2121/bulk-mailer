import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Animated rings */}
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-pink-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-rose-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner gradient ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-pink-500 border-r-fuchsia-500 border-b-rose-500 border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Center star */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="text-pink-400 text-xl font-black"
            >
              ✦
            </motion.span>
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-sm font-semibold tracking-widest uppercase">
              Loading
            </span>
            <div className="flex gap-1">
              {[0, 0.1, 0.2].map((delay, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                  className="text-pink-400 text-sm"
                >
                  .
                </motion.span>
              ))}
            </div>
          </div>

          {/* Subtle gradient bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="h-0.5 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
