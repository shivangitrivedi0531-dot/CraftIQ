import { useState } from "react";
import { X } from "lucide-react";

export default function ProfileModal({ open, onClose, user = { name: "Aisha Verma", email: "aisha@example.com" } }) {
  const [name, setName] = useState(user.name);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg text-ink-900">Your profile</p>
          <button onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-ink-600">Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mb-4 w-full rounded-lg border border-clay-200 bg-clay-50 px-3 py-2 text-sm outline-none focus:border-ochre-500" />

        <label className="mb-1 block text-xs font-medium text-ink-600">Email</label>
        <input value={user.email} disabled className="mb-6 w-full rounded-lg border border-clay-200 bg-clay-100 px-3 py-2 text-sm text-ink-400" />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-ochre-500 py-2 text-sm font-medium text-white hover:bg-ochre-600">Save</button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-clay-200 py-2 text-sm font-medium text-ink-700 hover:bg-clay-100">Logout</button>
        </div>
      </div>
    </div>
  );
}