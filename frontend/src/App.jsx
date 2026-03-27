import { useEffect, useMemo, useState } from "react";
import SearchBox from "./components/SearchBox.jsx";
import StopsList from "./components/StopsList.jsx";
import DeparturesList from "./components/DeparturesList.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [query, setQuery] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(false);
  const [error, setError] = useState("");

  async function searchStops() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/stops?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setStops(data);
    } catch (err) {
      setError("Could not search stops right now.");
    } finally {
      setIsSearching(false);
    }
  }

  async function loadDepartures(stop) {
    setSelectedStop(stop);
    setIsLoadingDepartures(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/departures/${encodeURIComponent(stop.id)}`);
      if (!response.ok) throw new Error("Departures failed");
      const data = await response.json();
      setDepartures(Array.isArray(data.departures) ? data.departures : []);
    } catch (err) {
      setError("Could not load departures right now.");
      setDepartures([]);
    } finally {
      setIsLoadingDepartures(false);
    }
  }

  useEffect(() => {
    if (!selectedStop) return;
    const interval = setInterval(() => {
      loadDepartures(selectedStop);
    }, 30_000);
    return () => clearInterval(interval);
  }, [selectedStop]);

  const title = useMemo(() => {
    return selectedStop ? selectedStop.name : "Stockholm transit";
  }, [selectedStop]);

  return (
    <main className="appShell">
      <header className="hero">
        <p className="badge">SL Live</p>
        <h1>{title}</h1>
        <p className="muted">Simple departure times for buses, trains, trams, ferries, and the subway.</p>
      </header>

      <SearchBox
        value={query}
        onChange={setQuery}
        onSearch={searchStops}
        isLoading={isSearching}
      />

      {error ? <p className="error globalError">{error}</p> : null}

      <div className="grid">
        <StopsList
          stops={stops}
          onSelect={loadDepartures}
          selectedStopId={selectedStop?.id}
        />
        <DeparturesList
          stopName={selectedStop?.name}
          departures={departures}
          isLoading={isLoadingDepartures}
          error=""
        />
      </div>
    </main>
  );
}
