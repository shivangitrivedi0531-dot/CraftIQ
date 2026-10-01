import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function formatDateTime(isoTimestamp) {
  const date = new Date(isoTimestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const datePart = isToday
    ? "Today"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

// Pairs a flat [{role, text, timestamp}, ...] list into [{user, ai}, ...]
function pairMessages(flatMessages) {
  const pairs = [];
  let pendingUser = null;
  for (const m of flatMessages) {
    if (m.role === "user") {
      pendingUser = m.text;
    } else if (m.role === "assistant" && pendingUser !== null) {
      pairs.push({ user: pendingUser, ai: m.text });
      pendingUser = null;
    }
  }
  return pairs;
}

export default function ChatHistoryTab({ category }) {
  const categoryId = category.id || "candle";
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  function loadConversations() {
    setLoading(true);
    fetch(`http://localhost:8000/conversations?category=${categoryId}`)
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConversations();
  }, [categoryId]);

  async function handleClearAll() {
    try {
      await fetch(`http://localhost:8000/conversations?category=${categoryId}`, {
        method: "DELETE",
      });
    } catch (err) {
      // Backend not running - still clear the visible list locally.
    }
    setConversations([]);
  }

  const nonEmptyConversations = conversations.filter((c) => c.messages.length > 0);
  const totalConversations = nonEmptyConversations.length;

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
        <p className="text-sm text-ink-400 mt-1">Past conversations about {category.label.toLowerCase()}</p>
      </div>

      {loading ? (
        <p className="text-center text-ink-400 text-sm py-16">Loading...</p>
      ) : totalConversations > 0 ? (
        <div className="space-y-4">
          {nonEmptyConversations.map((conv) => {
            const pairs = pairMessages(conv.messages);
            const preview = pairs[0]?.user || "New conversation";
            const isExpanded = expandedId === conv.conversation_id;

            return (
              <motion.div
                key={conv.conversation_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-clay-200 bg-white overflow-hidden"
              >
                {/* Conversation summary - click to expand/collapse */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : conv.conversation_id)}
                  className="w-full text-left px-5 py-4 hover:bg-clay-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{preview}</p>
                    <p className="text-xs text-ink-400 mt-1">
                      {formatDateTime(conv.created_at)} · {pairs.length} message{pairs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-ink-400 text-sm shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Full thread, shown when expanded */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-clay-100">
                    {pairs.map((msg, idx) => (
                      <div key={idx} className="space-y-2 pt-3">
                        <div className="flex justify-end">
                          <div className="max-w-xs lg:max-w-md bg-ochre-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm">
                            {msg.user}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-xs lg:max-w-md bg-clay-100 text-ink-900 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                            {msg.ai}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border-2 border-dashed border-clay-300 bg-clay-50"
        >
          <p className="text-3xl mb-3">💭</p>
          <p className="text-ink-600 font-semibold">No chat history yet</p>
          <p className="text-ink-400 text-sm mt-2">Start a conversation with the AI assistant to see it listed here.</p>
        </motion.div>
      )}

      {/* Quick Actions */}
      {totalConversations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-4"
        >
          <p className="font-semibold text-ink-900">Quick Actions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={loadConversations}
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
            >
              🗑️ Clear All Conversations
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {totalConversations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-50 border border-green-200"
        >
          <p className="text-sm font-semibold text-green-900">
            ✨ <span className="text-lg text-emerald-600">{totalConversations}</span> conversation{totalConversations !== 1 ? "s" : ""} saved
          </p>
          <p className="text-xs text-green-700 mt-2">💾 Your chat data is saved locally and never shared</p>
        </motion.div>
      )}
    </motion.div>
  );
}