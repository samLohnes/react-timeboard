export type ViewMode = 'games' | 'channels';

const OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: 'games', label: 'Games' },
  { value: 'channels', label: 'Channels' },
];

export function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="view-toggle" role="tablist" aria-label="View mode">
      {OPTIONS.map((option) => {
        const active = view === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={
              active
                ? 'view-toggle__option view-toggle__option--active'
                : 'view-toggle__option'
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
