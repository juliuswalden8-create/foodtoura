export function LegalDraftBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-semibold">Draft for client approval</p>
      <p className="mt-1">
        This page is a working draft. Replace placeholders with verified company
        details before public legal publication. Do not treat this as final
        counsel.
      </p>
    </div>
  );
}
