function formatUpdatedTime(lastUpdated) {
  if (!lastUpdated) return "Not updated yet";
  return `Updated ${lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

export default function SelectedStopHeader({
  stopName,
  lastUpdated,
  onRefresh,
  isRefreshing
}) {
  return (
    <section className="selectedStopCard">
      <div>
        <p className="eyebrow">Selected stop</p>
        <h2>{stopName || "Pick a stop"}</h2>
        <p className="muted">{formatUpdatedTime(lastUpdated)}</p>
      </div>

      <button
        className="refreshButton"
        onClick={onRefresh}
        disabled={!stopName || isRefreshing}
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </section>
  );
}