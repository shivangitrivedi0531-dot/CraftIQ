import { useState } from "react";
import { motion } from "framer-motion";
import { DUMMY_ARTISTS } from "../../data/dummyData";

export default function SimilarArtistsTab({ category }) {
  const categoryId = category.id || "candle";
  
  // Filter artists by category
  const artists = DUMMY_ARTISTS.filter((a) => a.category === categoryId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">👥 Similar Artists</p>
        <p className="text-sm text-ink-400 mt-1">Discover talented creators in {category.label}</p>
      </div>

      {/* Artists Grid */}
      {artists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-xl border-2 border-clay-200 bg-gradient-to-br from-white to-clay-50 p-6 hover:border-ochre-300 hover:shadow-lg transition-all"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-ochre-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg"
                >
                  📸
                </motion.div>
              </div>

              {/* Handle */}
              <h3 className="font-display text-center text-lg text-ink-900 truncate">
                {artist.handle}
              </h3>

              {/* Followers */}
              <p className="text-center text-sm text-ochre-600 font-semibold mt-2">
                👥 {artist.followers} followers
              </p>

              {/* Category Badge */}
              <div className="flex justify-center mt-3 mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  {categoryId}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-ink-600 text-center mb-4">
                Specializes in {category.label.toLowerCase()} art & business tips
              </p>

              {/* Visit Button */}
              <motion.a
                href={`https://instagram.com/${artist.handle.slice(1)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block w-full py-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-sm font-bold rounded-lg text-center transition-all shadow-md hover:shadow-lg"
              >
                Visit Profile →
              </motion.a>

              {/* Follow button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-2 py-2 border-2 border-ochre-300 text-ochre-600 hover:bg-ochre-50 text-sm font-medium rounded-lg transition-all"
              >
                Follow
              </motion.button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border-2 border-dashed border-clay-300 bg-clay-50"
        >
          <p className="text-3xl mb-3">🎨</p>
          <p className="text-ink-600 font-semibold">No artists found for this category</p>
          <p className="text-ink-400 text-sm mt-2">Check back soon!</p>
        </motion.div>
      )}

      {/* Stats */}
      {artists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-orange-50 border-2 border-pink-200"
        >
          <p className="text-sm font-semibold text-pink-900">
            ✨ Found <span className="text-lg text-orange-600">{artists.length}</span> amazing artists in this category
          </p>
          <p className="text-xs text-pink-700 mt-2">Follow them for inspiration & networking! 💫</p>
        </motion.div>
      )}
    </motion.div>
  );
}