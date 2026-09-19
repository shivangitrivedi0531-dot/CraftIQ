import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function DemandOverTimeChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-clay-200 bg-white p-6 hover:shadow-md transition-shadow"
    >
      <p className="font-display text-base text-ink-900 mb-4">Demand Trend Over 4 Weeks</p>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C98A2C" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#C98A2C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD3" />
          <XAxis dataKey="week" stroke="#8A8073" style={{ fontSize: "12px" }} />
          <YAxis stroke="#8A8073" style={{ fontSize: "12px" }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#FAF7F2", 
              border: "1px solid #E6DFD3",
              borderRadius: "8px"
            }}
            cursor={{ stroke: "#C98A2C", strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="demand" 
            stroke="#C98A2C" 
            strokeWidth={3}
            dot={{ fill: "#C98A2C", r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}