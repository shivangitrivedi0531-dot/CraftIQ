import { motion } from "framer-motion";

export default function ProfitOpportunityCard({ value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-ochre-200 bg-gradient-to-br from-ochre-50 to-clay-100 p-8 hover:shadow-md transition-shadow"
    >
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Weekly Profit Opportunity</p>
      
      <div className="mt-4 flex items-end gap-3">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-display text-5xl text-ochre-600"
        >
          ₹{value.toLocaleString()}
        </motion.div>
        <span className="text-3xl mb-2">💎</span>
      </div>

      <p className="mt-4 text-sm text-ink-600">
        Based on current demand & pricing. This is your potential weekly revenue if you scale production.
      </p>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium"
      >
        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
        Real-time calculation based on market data
      </motion.div>
    </motion.div>
  );
}