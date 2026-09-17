import { motion } from "framer-motion";
import { DUMMY_CHAT_HISTORY } from "../../data/dummyData";

export default function ChatHistoryTab({ category }) {
  const categoryId = category.id || "candle";
  const history = DUMMY_CHAT_HISTORY[categoryId] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xl text-ink-900">💬 Chat History</p>
        <p className="text-sm text-ink-400 mt-1">Review past conversations about {category.label.toLowerCase()}</p>
      </div>

      {/* Chat History */}
      {history.length > 0 ? (
        <div className="space-y-6">
          {history.map((dayGroup, dayIdx) => (
            <motion.div
              key={dayIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIdx * 0.1 }}
              className="space-y-3"
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-clay-200 to-transparent" />
                <span className="px-3 py-1 bg-clay-100 text-ink-600 font-semibold text-xs rounded-full">
                  📅 {dayGroup.date}
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-clay-200 to-transparent" />
              </div>

              {/* Messages for this day */}
              <div className="space-y-3 pl-4 border-l-2 border-ochre-300">
                {dayGroup.messages.map((msg, msgIdx) => (
                  <motion.div
                    key={msgIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIdx * 0.1 + msgIdx * 0.05 }}
                    className="space-y-2"
                  >
                    {/* User Message */}
                    <div className="flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="max-w-xs lg:max-w-md bg-gradient-to-br from-ochre-500 to-orange-500 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <p className="text-sm">{msg.user}</p>
                        <p className="text-xs text-white/70 mt-1">You</p>
                      </motion.div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="max-w-xs lg:max-w-md bg-gradient-to-br from-clay-100 to-clay-50 text-ink-900 rounded-2xl rounded-tl-sm px-5 py-3 border-l-4 border-ochre-400 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <p className="text-sm leading-relaxed">{msg.ai}</p>
                        <p className="text-xs text-ink-400 mt-2">🤖 CraftIQ Assistant</p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
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
          <p className="text-3xl mb-3">💭</p>
          <p className="text-ink-600 font-semibold">No chat history yet</p>
          <p className="text-ink-400 text-sm mt-2">Start a conversation with the AI assistant to see your chat history here!</p>
        </motion.div>
      )}

      {/* Quick Actions */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 space-y-4"
        >
          <p className="font-semibold text-ink-900">💡 Quick Actions:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all"
            >
              📋 Export Chat
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all"
            >
              🔍 Search History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-all"
            >
              🗑️ Clear History
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
        >
          <p className="text-sm font-semibold text-green-900">
            ✨ <span className="text-lg text-emerald-600">{history.length}</span> conversation{history.length !== 1 ? 's' : ''} saved
          </p>
          <p className="text-xs text-green-700 mt-2">💾 Your chat data is saved locally and never shared</p>
        </motion.div>
      )}
    </motion.div>
  );
}