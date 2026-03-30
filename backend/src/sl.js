const STOP_FINDER_URL = "https://journeyplanner.integration.sl.se/v2/stop-finder";
const SITES_URL = "https://transport.integration.sl.se/v1/sites";

export async function searchStops(query) {
  const [journeyStops, sites] = await Promise.all([
    fetchJourneyPlannerStops(query),
    fetchTransportSites()
  ]);

  const normalizedSites = sites.map((site) => ({
    id: String(site.id),
    name: normalizeName(site.name)
  }));

  return journeyStops
    .map((stop) => {
      const normalizedStopName = normalizeName(stop.name);

      const exactMatch = normalizedSites.find(
        (site) => site.name === normalizedStopName
      );

      const looseMatch = exactMatch || normalizedSites.find(
        (site) =>
          site.name.includes(normalizedStopName) ||
          normalizedStopName.includes(site.name)
      );

      return {
        id: looseMatch?.id || "",
        name: stop.name,
        type: "stop"
      };
    })
    .filter((stop) => stop.id);
}

async function fetchJourneyPlannerStops(query) {
  const url = new URL(STOP_FINDER_URL);
  url.searchParams.set("name_sf", query);
  url.searchParams.set("any_obj_filter_sf", "2");
  url.searchParams.set("type_sf", "any");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SL stop finder failed with ${response.status}`);
  }

  const data = await response.json();
  console.log("DEPARTURES RESPONSE", JSON.stringify(data, null, 2));
  const locations = Array.isArray(data?.locations) ? data.locations : [];

  return locations
    .filter((item) => item?.type === "stop")
    .map((item) => ({
      name: item?.name ?? item?.disassembledName ?? "Unknown stop"
    }));
}

async function fetchTransportSites() {
  const response = await fetch(SITES_URL);
  if (!response.ok) {
    throw new Error(`SL sites failed with ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/^stockholm,\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}


export async function getDepartures(stopId) {
  const url = `https://transport.integration.sl.se/v1/sites/${encodeURIComponent(stopId)}/departures`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SL departures failed with ${response.status}`);
  }

  const data = await response.json();

  const rawDepartures = Array.isArray(data?.departures)
    ? data.departures
    : flattenLegacyModeBuckets(data);

  const departures = rawDepartures.map((item) => ({
    type: mapTransportMode(item?.transport_mode),
    line: item?.designation ?? item?.line?.designation ?? item?.line?.name ?? item?.name ?? "",
    destination: item?.destination ?? item?.direction ?? "Unknown destination",
    scheduled: item?.scheduled ?? null,
    expected: item?.expected ?? item?.display ?? null,
    countdown: getCountdown(item?.expected, item?.scheduled)
  }));

  return {
    stop: data?.site?.name ?? String(stopId),
    departures: departures
      .sort((a, b) => compareTimes(a.expected || a.scheduled, b.expected || b.scheduled))
      .slice(0, 20)
  };
}

function flattenLegacyModeBuckets(data) {
  const categories = ["metro", "bus", "train", "tram", "ship"];
  return categories.flatMap((key) => Array.isArray(data?.[key]) ? data[key] : []);
}

function mapTransportMode(mode) {
  switch (mode) {
    case "METRO":
      return "subway";
    case "TRAIN":
      return "train";
    case "TRAM":
      return "tram";
    case "SHIP":
      return "ferry";
    case "BUS":
    default:
      return "bus";
  }
}
function compareTimes(a, b) {
  return new Date(a || 0).getTime() - new Date(b || 0).getTime();
}

function getCountdown(expected, scheduled) {
  const liveValue = parseSlTime(expected);
  const scheduledValue = parseSlTime(scheduled);
  const target = liveValue ?? scheduledValue;

  if (!target) return "time unavailable";

  const diffMs = target.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);

  if (minutes <= 0) return "now";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

function parseSlTime(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return null;
}
