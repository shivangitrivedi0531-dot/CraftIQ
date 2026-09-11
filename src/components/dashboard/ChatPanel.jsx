import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { DUMMY_MESSAGES } from "../../data/dummyData";

export default function ChatPanel({ category }) {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: `(demo reply) Once connected, I'll answer ${category.label.toLowerCase()} questions here using live data.` },
      ]);
      setIsThinking(false);
    }, 700);
  }

  return (
    <aside className="flex h-full w-full flex-col rounded-xl border border-clay-200 bg-white">
      <div className="border-b border-clay-200 px-4 py-3">
        <p className="font-display text-base text-ink-900">Craft Assistant</p>
        <p className="text-xs text-ink-400">Ask anything about {category.label.toLowerCase()}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={["max-w-[85%] rounded-2xl px-4 py-2 text-sm", m.role === "user" ? "bg-ochre-500 text-white rounded-br-sm" : "bg-clay-100 text-ink-900 rounded-bl-sm"].join(" ")}>
              {m.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-clay-100 px-4 py-2 text-sm text-ink-400">typing…</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-clay-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-clay-200 bg-clay-50 px-3 py-2 text-sm text-ink-900 outline-none focus:border-ochre-500"
        />
        <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-lg bg-ochre-500 text-white transition-colors hover:bg-ochre-600 disabled:opacity-40" disabled={!input.trim()} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}