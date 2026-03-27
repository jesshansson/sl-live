export default function StopsList({ stops, onSelect, selectedStopId }) {
  if (!stops.length) return null;

  return (
    <section className="card">
      <h2>Stops</h2>
      <ul className="list">
        {stops.map((stop) => (
          <li key={stop.id}>
            <button
              className={selectedStopId === stop.id ? "row active" : "row"}
              onClick={() => onSelect(stop)}
            >
              <span>{stop.name}</span>
              <span className="muted">{stop.type}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
