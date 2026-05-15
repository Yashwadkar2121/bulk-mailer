import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-pink-500/20 p-5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-pink-500/10">
            <Icon className="w-5 h-5 text-pink-400" />
          </div>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
          >
            {value}
          </motion.span>
        </div>

        <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${trend > 0 ? "text-green-400" : "text-red-400"}`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
