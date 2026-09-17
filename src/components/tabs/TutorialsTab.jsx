import { motion } from "framer-motion";
import { DUMMY_TUTORIALS } from "../../data/dummyData";

export default function TutorialsTab({ category }) {
  const categoryId = category.id || "candle";
  const tutorials = DUMMY_TUTORIALS[categoryId] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">🎥 Tutorials</p>
        <p className="text-sm text-ink-400 mt-1">Learn {category.label.toLowerCase()} skills from YouTube experts</p>
      </div>

      {/* Tutorials Grid */}
      {tutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="rounded-xl overflow-hidden border-2 border-clay-200 bg-white hover:border-ochre-300 hover:shadow-xl transition-all"
            >
              {/* Video Thumbnail */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                {/* Animated play button background */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-ochre-500/20 to-orange-500/20"
                />

                {/* Play button */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="relative z-10 w-16 h-16 bg-ochre-500 hover:bg-ochre-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all"
                >
                  <span className="text-3xl text-white ml-1">▶️</span>
                </motion.div>

                {/* Video icon */}
                <div className="absolute top-3 right-3 text-white text-2xl">🎬</div>
              </div>

              {/* Video Details */}
              <div className="p-5">
                <h3 className="font-semibold text-ink-900 text-sm line-clamp-2">
                  {video.title}
                </h3>

                <p className="text-xs text-ink-400 mt-2">YouTube Tutorial</p>

                {/* Level badge */}
                <div className="flex gap-2 mt-3 mb-4">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Beginner Friendly
                  </span>
                </div>

                {/* Watch Button */}
                <motion.a
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block w-full py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm font-bold rounded-lg text-center transition-all shadow-md hover:shadow-lg"
                >
                  Watch on YouTube →
                </motion.a>

                {/* Duration fake badge */}
                <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                  <span>⏱️ 15-20 minutes</span>
                  <span>👁️ 50K+ views</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border-2 border-dashed border-clay-300 bg-clay-50"
        >
          <p className="text-3xl mb-3">📹</p>
          <p className="text-ink-600 font-semibold">No tutorials available yet</p>
          <p className="text-ink-400 text-sm mt-2">Check back soon for beginner-friendly videos!</p>
        </motion.div>
      )}

      {/* Learning Path */}
      {tutorials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200"
        >
          <p className="font-semibold text-ink-900 mb-3">📚 Suggested Learning Path:</p>
          <ol className="space-y-2 text-sm text-ink-700">
            <li>1️⃣ Start with <strong>Beginner Basics</strong> — master the fundamentals</li>
            <li>2️⃣ Practice with <strong>simple projects</strong> — build confidence</li>
            <li>3️⃣ Explore <strong>advanced techniques</strong> — level up your skills</li>
            <li>4️⃣ <strong>Monetize</strong> — turn your passion into profit 💰</li>
          </ol>
        </motion.div>
      )}

      {/* Stats */}
      {tutorials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200"
        >
          <p className="text-sm font-semibold text-yellow-900">
            ✨ <span className="text-lg text-orange-600">{tutorials.length}</span> curated tutorials to level up your {category.label.toLowerCase()} skills
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}