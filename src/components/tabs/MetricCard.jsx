import { motion } from "framer-motion";

export default function MetricCard({ 
  label, 
  value, 
  unit = "", 
  icon = "📊", 
  trend = null, 
  bgColor = "bg-clay-100",
  borderColor = "border-clay-200"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border ${borderColor} ${bgColor} p-6 backdrop-blur-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl text-ink-900">{value}</span>
            {unit && <span className="text-sm text-ink-600">{unit}</span>}
          </p>
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}