import { motion } from "framer-motion";

export default function SearchInterestCard({ interest }) {
  const percentage = (interest / 100) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-purple-200 bg-purple-50 p-6 backdrop-blur-sm hover:shadow-md transition-shadow"
    >
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Search Interest</p>
      <p className="mt-3 font-display text-3xl text-ink-900">{interest}</p>
      <p className="text-xs text-ink-600 mb-3">out of 100</p>

      {/* Animated progress bar */}
      <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
        />
      </div>
      <p className="mt-2 text-xs text-purple-600">Strong online interest 🔍</p>
    </motion.div>
  );
}