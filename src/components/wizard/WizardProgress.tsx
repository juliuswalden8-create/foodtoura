const STEPS = [
  { id: 1, label: "Location" },
  { id: 2, label: "Guests" },
  { id: 3, label: "Food" },
  { id: 4, label: "Allergies" },
] as const;

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-charcoal-muted">
        <span>
          Step {step} of {STEPS.length}
        </span>
        <span>{STEPS[step - 1]?.label}</span>
      </div>
      <div className="flex gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              s.id <= step ? "bg-terracotta" : "bg-mist"
            }`}
            aria-hidden
          />
        ))}
      </div>
      <ol className="mt-3 hidden grid-cols-4 gap-2 sm:grid">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={`text-center text-xs ${
              s.id === step
                ? "font-semibold text-forest"
                : s.id < step
                  ? "text-forest-muted"
                  : "text-charcoal-muted"
            }`}
          >
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
