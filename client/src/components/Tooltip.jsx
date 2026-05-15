import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
  const [tooltip, setTooltip] = useState(null);
  const timeoutRef = useRef();

  const showTooltip = (content, position, targetRect) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTooltip({ content, position, targetRect });
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => setTooltip(null), 100);
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
            style={{
              top:
                tooltip.position === "top"
                  ? tooltip.targetRect.top - 35
                  : tooltip.targetRect.bottom + 10,
              left: tooltip.targetRect.left + tooltip.targetRect.width / 2 - 50,
            }}
          >
            {tooltip.content}
            <div
              className="absolute w-2 h-2 bg-gray-900 rotate-45 left-1/2 -translate-x-1/2"
              style={{ top: tooltip.position === "top" ? "100%" : "-4px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => useContext(TooltipContext);
