import { useState, useRef, useEffect } from "react";
import { Send, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DUMMY_MESSAGES } from "../../data/dummyData";

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink-900">{children}</strong>,
  h1: ({ children }) => <p className="mb-2 mt-1 font-display text-base text-ink-900">{children}</p>,
  h2: ({ children }) => <p className="mb-2 mt-1 font-display text-base text-ink-900">{children}</p>,
  h3: ({ children }) => <p className="mb-1 mt-1 font-semibold text-sm text-ink-900">{children}</p>,
  code: ({ children }) => <code className="rounded bg-clay-200 px-1 py-0.5 text-xs">{children}</code>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-ochre-700">
      {children}
    </a>
  ),
};

export default function ChatPanel({ category }) {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  function loadHistory() {
    fetch(`http://localhost:8000/chat-history?category=${category.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          const loaded = data.messages.map((m, idx) => ({
            id: `history-${idx}-${m.timestamp}`,
            role: m.role,
            text: m.text,
          }));
          setMessages(loaded);
        } else {
          setMessages(DUMMY_MESSAGES);
        }
      })
      .catch(() => {
        setMessages(DUMMY_MESSAGES);
      });
  }

  useEffect(() => {
    loadHistory();
  }, [category.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.id,
          message: text,
          chat_history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Couldn't reach the server. Is the backend running on localhost:8000?",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  async function handleNewChat() {
    try {
      await fetch(`http://localhost:8000/chat/new?category=${category.id}`, {
        method: "POST",
      });
    } catch (err) {
      // Backend not running - still reset the visible chat locally.
    }
    setMessages(DUMMY_MESSAGES);
  }

  return (
    <aside className="flex h-full w-full flex-col rounded-xl border border-clay-200 bg-white">
      <div className="flex items-center justify-between border-b border-clay-200 px-4 py-3">
        <div>
          <p className="font-display text-base text-ink-900">Craft Assistant</p>
          <p className="text-xs text-ink-400">Ask anything about {category.label.toLowerCase()}</p>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 rounded-lg border border-clay-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-clay-100"
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                m.role === "user"
                  ? "bg-ochre-500 text-white rounded-br-sm"
                  : "bg-clay-100 text-ink-900 rounded-bl-sm",
              ].join(" ")}
            >
              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                m.text
              )}
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