export function StatusBar({
  unassignedCount,
  totalCount,
}: {
  unassignedCount: number;
  totalCount: number;
}) {
  const assigned = totalCount - unassignedCount;
  const complete = unassignedCount === 0;
  const rightClass = complete ? 'status-bar__right status-bar__right--complete' : 'status-bar__right';
  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className="status-bar__left">
        <span className="status-bar__dot" aria-hidden="true" />
        <span className="status-bar__label">LIVE BOARD</span>
      </div>
      <div className="status-bar__center">
        <time className="status-bar__time">MARCH 15 · 2024</time>
      </div>
      <div className={rightClass}>
        <span className="status-bar__count">
          {String(assigned).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
        </span>
        <span className="status-bar__count-label">GAMES ASSIGNED</span>
      </div>
    </div>
  );
}
