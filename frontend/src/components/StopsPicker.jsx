export default function StopsPicker({ stops, selectedStopId, onSelect, isSearching }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Stops</h2>
        {isSearching ? <span className="muted">Searching…</span> : null}
      </div>

      {!isSearching && stops.length === 0 ? (
        <p className="muted">Search for a stop to get started.</p>
      ) : null}

      <div className="stopsList">
        {stops.map((stop) => (
          <button
            key={stop.id}
            className={selectedStopId === stop.id ? "stopButton active" : "stopButton"}
            onClick={() => onSelect(stop)}
          >
            <span className="stopName">{stop.name}</span>
            <span className="stopMeta">{stop.type}</span>
          </button>
        ))}
      </div>
    </section>
  );
}