import { useEffect, useMemo, useState } from "react";
import SearchBox from "./components/SearchBox.jsx";
import StopsPicker from "./components/StopsPicker.jsx";
import SelectedStopHeader from "./components/SelectedStopHeader.jsx";
import DeparturesList from "./components/DeparturesList.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [query, setQuery] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [departuresError, setDeparturesError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function searchStops() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    setIsSearching(true);
    setSearchError("");
    setDeparturesError("");

    try {
      const response = await fetch(`${API_BASE_URL}/stops?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      const nextStops = Array.isArray(data) ? data : [];
      setStops(nextStops);

      if (nextStops.length > 0) {
        await loadDepartures(nextStops[0]);
      } else {
        setSelectedStop(null);
        setDepartures([]);
      }
    } catch {
      setSearchError("Could not search stops right now.");
      setStops([]);
      setSelectedStop(null);
      setDepartures([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function loadDepartures(stop) {
    setSelectedStop(stop);
    setIsLoadingDepartures(true);
    setDeparturesError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/departures/${encodeURIComponent(stop.id)}`
      );
      if (!response.ok) throw new Error("Departures failed");

      const data = await response.json();
      setDepartures(Array.isArray(data.departures) ? data.departures : []);
      setLastUpdated(new Date());
    } catch {
      setDeparturesError("Could not load departures right now.");
      setDepartures([]);
    } finally {
      setIsLoadingDepartures(false);
    }
  }

  useEffect(() => {
    if (!selectedStop) return;

    const interval = setInterval(() => {
      loadDepartures(selectedStop);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedStop]);

  const title = useMemo(() => {
    return selectedStop?.name || "Stockholm transit";
  }, [selectedStop]);

  return (
    <main className="appShell">
      <header className="hero">
        <span className="badge">SL Live</span>
        <h1>{title}</h1>
        <p className="subtitle">
          Fast, simple live departures for buses, trains, trams, ferries, and the subway.
        </p>
      </header>

      <SearchBox
        value={query}
        onChange={setQuery}
        onSearch={searchStops}
        isLoading={isSearching}
      />

      {searchError ? <p className="errorBanner">{searchError}</p> : null}

      <div className="layout">
        <aside className="sidebar">
          <StopsPicker
            stops={stops}
            selectedStopId={selectedStop?.id}
            onSelect={loadDepartures}
            isSearching={isSearching}
          />
        </aside>

        <section className="mainPanel">
          <SelectedStopHeader
            stopName={selectedStop?.name}
            lastUpdated={lastUpdated}
            onRefresh={() => selectedStop && loadDepartures(selectedStop)}
            isRefreshing={isLoadingDepartures}
          />

          <DeparturesList
            departures={departures}
            isLoading={isLoadingDepartures}
            error={departuresError}
            hasSelectedStop={Boolean(selectedStop)}
          />
        </section>
      </div>
    </main>
  );
}