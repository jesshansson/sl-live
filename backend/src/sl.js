const STOP_FINDER_URL = "https://journeyplanner.integration.sl.se/v2/stop-finder";
const DEPARTURES_URL = "https://transport.integration.sl.se/v1/sites";

export async function searchStops(query) {
  const url = new URL(STOP_FINDER_URL);
  url.searchParams.set("name_sf", query);
  url.searchParams.set("any_obj_filter_sf", "2");
  url.searchParams.set("type_sf", "any");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SL stop finder failed with ${response.status}`);
  }

  const data = await response.json();
  const stopLocations = Array.isArray(data?.stopLocations) ? data.stopLocations : [];

  return stopLocations.map((item) => ({
    id: item?.id ?? item?.properties?.stopId ?? "",
    name: item?.name ?? "Unknown stop",
    type: item?.productAtStop ? "station" : "stop"
  })).filter((item) => item.id);
}

export async function getDepartures(stopId) {
  const url = `${DEPARTURES_URL}/${encodeURIComponent(stopId)}/departures`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SL departures failed with ${response.status}`);
  }

  const data = await response.json();
  const categories = [
    ["metros", "subway"],
    ["buses", "bus"],
    ["trains", "train"],
    ["trams", "tram"],
    ["ships", "ferry"]
  ];

  const departures = [];

  for (const [key, label] of categories) {
    const items = Array.isArray(data?.[key]) ? data[key] : [];
    for (const item of items) {
      departures.push({
        type: label,
        line: item?.line?.designation ?? item?.designation ?? "",
        destination: item?.destination ?? "Unknown destination",
        scheduled: item?.scheduled ?? null,
        expected: item?.expected ?? item?.display ?? null,
        countdown: getCountdown(item?.expected ?? item?.scheduled)
      });
    }
  }

  return {
    stop: data?.site?.name ?? String(stopId),
    departures: departures
      .sort((a, b) => compareTimes(a.expected || a.scheduled, b.expected || b.scheduled))
      .slice(0, 20)
  };
}

function compareTimes(a, b) {
  return new Date(a || 0).getTime() - new Date(b || 0).getTime();
}

function getCountdown(timestamp) {
  if (!timestamp) return "time unavailable";
  const minutes = Math.round((new Date(timestamp).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return "now";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}
