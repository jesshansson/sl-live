const icons = {
  bus: "🚌",
  train: "🚆",
  subway: "🚇",
  tram: "🚊",
  ferry: "⛴️"
};

export default function DeparturesList({ stopName, departures, isLoading, error }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <h2>{stopName ? `Next departures for ${stopName}` : "Departures"}</h2>
        {isLoading ? <span className="muted">Updating…</span> : null}
      </div>

      {error ? <p className="error">{error}</p> : null}
      {!error && !departures.length ? (
        <p className="muted">Pick a stop to see the next departures.</p>
      ) : null}

      <ul className="list">
        {departures.map((departure, index) => (
          <li className="departure" key={`${departure.line}-${departure.destination}-${index}`}>
            <div className="line">
              <span className="emoji">{icons[departure.type] || "🚍"}</span>
              <strong>{departure.line || "—"}</strong>
            </div>
            <div className="destination">{departure.destination}</div>
            <div className="countdown">{departure.countdown}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
