import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfileService } from "../../services/authService";

export default function ProfileModal({ open, onClose }) {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.display_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isMountedRef = useRef(true);

  // Synchronize local input state whenever modal is opened or user profile changes
  useEffect(() => {
    isMountedRef.current = true;
    if (open && user) {
      setName(user.display_name || "");
      setErrorMsg("");
      setSuccessMsg("");
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [open, user]);

  if (!open) return null;

  async function handleSave(e) {
    e.preventDefault();
    if (isSaving) return;

    setErrorMsg("");
    setSuccessMsg("");
    setIsSaving(true);

    try {
      const updatedUser = await updateProfileService(token, { display_name: name });

      // Ensure state is not updated if modal was unmounted or logged out during pending save
      if (isMountedRef.current && token) {
        setUser(updatedUser);
        setSuccessMsg("Profile updated!");
        setTimeout(() => {
          if (isMountedRef.current) onClose();
        }, 500);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setErrorMsg(err.message || "Failed to update profile");
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }

  function handleLogout() {
    logout();
    onClose();
    navigate("/login");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg text-ink-900">Your profile</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-400 hover:text-ink-900"
            disabled={isSaving}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-600">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 rounded-lg bg-emerald-50 p-2 text-xs font-medium text-emerald-700">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <label className="mb-1 block text-xs font-medium text-ink-600">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded-lg border border-clay-200 bg-clay-50 px-3 py-2 text-sm outline-none focus:border-ochre-500"
            disabled={isSaving}
            required
          />

          <label className="mb-1 block text-xs font-medium text-ink-600">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="mb-6 w-full rounded-lg border border-clay-200 bg-clay-100 px-3 py-2 text-sm text-ink-400 cursor-not-allowed"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg bg-ochre-500 py-2 text-sm font-medium text-white transition-colors hover:bg-ochre-600 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-clay-200 py-2 text-sm font-medium text-ink-700 hover:bg-clay-100 disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}