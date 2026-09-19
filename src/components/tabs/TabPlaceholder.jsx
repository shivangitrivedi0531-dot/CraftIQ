export default function TabPlaceholder({ title, description }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-clay-300 bg-clay-100/50 px-6 py-16 text-center">
      <p className="font-display text-lg text-ink-700">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-ink-400">{description}</p>
    </div>
  );
}