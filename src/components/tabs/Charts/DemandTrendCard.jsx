import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DemandTrendCard({ trend }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < trend) {
        count++;
        setDisplayValue(count);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [trend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl border border-green-200 bg-green-50 p-6 backdrop-blur-sm hover:shadow-md transition-shadow"
    >
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Demand Trend</p>
      <div className="mt-3 flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-display text-4xl text-green-600"
        >
          {displayValue}%
        </motion.div>
        <span className="text-2xl">📈</span>
      </div>
      <p className="mt-2 text-xs text-green-600 font-medium">↑ Upward momentum this month</p>
    </motion.div>
  );
}