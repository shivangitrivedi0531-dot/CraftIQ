import { useState } from "react";
import { motion } from "framer-motion";
import { DUMMY_CALCULATOR_MATERIALS } from "../../data/dummyData";

export default function CalculatorTab({ category }) {
  const categoryId = category.id || "candle";
  const materials = DUMMY_CALCULATOR_MATERIALS[categoryId] || [];
  const [quantities, setQuantities] = useState({});

  // Calculate total material cost
  const totalCost = Object.entries(quantities).reduce((sum, [idx, qty]) => {
    const cost = materials[idx]?.cost || 0;
    return sum + (cost * (parseFloat(qty) || 0));
  }, 0);

  // Suggested selling price (2.5x markup for profit margin)
  const suggestedPrice = Math.round(totalCost * 2.5);

  // Profit margin
  const profit = suggestedPrice - totalCost;

  const handleQuantityChange = (index, value) => {
    setQuantities({ ...quantities, [index]: value });
  };

  const handleReset = () => {
    setQuantities({});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">Material Cost Calculator</p>
        <p className="text-sm text-ink-400 mt-1">Enter quantities to calculate total cost & suggested selling price</p>
      </div>

      {/* Materials Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-clay-200 bg-white p-6 space-y-4"
      >
        <h3 className="font-semibold text-ink-900 mb-4">📦 Materials</h3>

        {materials.length > 0 ? (
          materials.map((material, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 bg-clay-50 rounded-lg hover:bg-clay-100 transition-colors"
            >
              {/* Material name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">{material.name}</p>
                <p className="text-xs text-ink-400">₹{material.cost} per unit</p>
              </div>

              {/* Quantity input */}
              <input
                type="number"
                placeholder="0"
                min="0"
                step="0.1"
                value={quantities[idx] || ""}
                onChange={(e) => handleQuantityChange(idx, e.target.value)}
                className="w-24 px-3 py-2 border border-clay-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ochre-500 bg-white"
              />

              {/* Subtotal */}
              <div className="text-right min-w-fit">
                <p className="text-sm font-semibold text-ochre-600">
                  ₹{((quantities[idx] || 0) * material.cost).toFixed(0)}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-ink-400 text-sm">No materials for this category</p>
        )}
      </motion.div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Material Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center"
        >
          <p className="text-xs font-medium text-ink-400 uppercase">Total Material Cost</p>
          <motion.p
            key={totalCost}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-display text-3xl text-blue-600 mt-3"
          >
            ₹{totalCost.toFixed(0)}
          </motion.p>
          <p className="text-xs text-ink-600 mt-2">Your production cost</p>
        </motion.div>

        {/* Suggested Selling Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
        >
          <p className="text-xs font-medium text-ink-400 uppercase">Suggested Price</p>
          <motion.p
            key={suggestedPrice}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-display text-3xl text-green-600 mt-3"
          >
            ₹{suggestedPrice.toFixed(0)}
          </motion.p>
          <p className="text-xs text-ink-600 mt-2">With 2.5x markup</p>
        </motion.div>

        {/* Profit Margin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-ochre-200 bg-ochre-50 p-6 text-center"
        >
          <p className="text-xs font-medium text-ink-400 uppercase">Your Profit</p>
          <motion.p
            key={profit}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-display text-3xl text-ochre-600 mt-3"
          >
            ₹{profit.toFixed(0)}
          </motion.p>
          <p className="text-xs text-ink-600 mt-2">Per unit margin</p>
        </motion.div>
      </div>

      {/* Reset Button */}
      {Object.keys(quantities).length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleReset}
          className="w-full px-4 py-2 bg-ink-100 hover:bg-ink-200 text-ink-900 rounded-lg font-medium transition-colors"
        >
          Clear All
        </motion.button>
      )}

      {/* Footer tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-lg bg-yellow-50 border border-yellow-200"
      >
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> You can adjust the 2.5x markup based on your competition, demand, and profit goals.
        </p>
      </motion.div>
    </motion.div>
  );
}