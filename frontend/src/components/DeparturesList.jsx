const icons = {
  bus: "🚌",
  train: "🚆",
  subway: "🚇",
  tram: "🚊",
  ferry: "⛴️"
};

function formatScheduledTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function DeparturesList({
  departures,
  isLoading,
  error,
  hasSelectedStop
}) {
  return (
    <section className="panel departuresPanel">
      <div className="panelHeader">
        <h2>Next departures</h2>
        {isLoading ? <span className="muted">Loading…</span> : null}
      </div>

      {error ? <p className="errorBanner">{error}</p> : null}

      {!error && !hasSelectedStop ? (
        <p className="muted">Search and pick a stop to see live departures.</p>
      ) : null}

      {!error && hasSelectedStop && !isLoading && departures.length === 0 ? (
        <p className="muted">No departures found right now.</p>
      ) : null}

      <div className="departuresGrid">
        {departures.map((departure, index) => (
          <article
            key={`${departure.line}-${departure.destination}-${index}`}
            className="departureCard"
          >
            <div className="departureTop">
              <div className="modeLine">
                <span className="modeIcon">{icons[departure.type] || "🚍"}</span>
                <span className="lineBadge">{departure.line || "—"}</span>
              </div>

              <div className="countdownBig">{departure.countdown}</div>
            </div>

            <div className="destinationText">{departure.destination}</div>

            <div className="departureMeta">
              <span className="modePill">{departure.type}</span>
              {formatScheduledTime(departure.scheduled) ? (
                <span className="muted">
                  Scheduled {formatScheduledTime(departure.scheduled)}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}