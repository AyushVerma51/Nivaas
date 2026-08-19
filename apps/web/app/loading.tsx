export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex items-center gap-3 text-ink/50">
        <span className="size-4 animate-spin rounded-full border border-ink/30 border-t-ink" />
        <span className="text-sm tracking-wide">Loading…</span>
      </div>
    </div>
  );
}
