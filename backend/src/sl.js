const STOP_FINDER_URL = "https://journeyplanner.integration.sl.se/v2/stop-finder";
const DEPARTURES_URL = "https://transport.integration.sl.se/v1/sites";

export async function searchStops(query) {
  const url = new URL("https://journeyplanner.integration.sl.se/v2/stop-finder");
  url.searchParams.set("name_sf", query);
  url.searchParams.set("any_obj_filter_sf", "2");
  url.searchParams.set("type_sf", "any");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SL stop finder failed with ${response.status}`);
  }

  const data = await response.json();
  const locations = Array.isArray(data?.locations) ? data.locations : [];

  return locations
    .filter((item) => item?.type === "stop")
    .map((item) => {
      const rawId = String(item?.id ?? item?.properties?.stopId ?? "");
      return {
        id: convertToSiteId(rawId),
        rawId,
        name: item?.name ?? item?.disassembledName ?? "Unknown stop",
        type: item?.type ?? "stop"
      };
    })
    .filter((item) => item.id);
}

function convertToSiteId(rawId) {
  if (!rawId) return "";
  if (/^3\d{8}$/.test(rawId)) {
    return rawId.slice(3);
  }
  return rawId;
}
export async function getDepartures(stopId) {
  const url = `https://transport.integration.sl.se/v1/sites/${encodeURIComponent(stopId)}/departures`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SL departures failed with ${response.status}`);
  }

  const data = await response.json();

  const categories = [
    ["metro", "subway"],
    ["bus", "bus"],
    ["train", "train"],
    ["tram", "tram"],
    ["ship", "ferry"]
  ];

  const departures = [];

  for (const [key, label] of categories) {
    const items = Array.isArray(data?.[key]) ? data[key] : [];
    for (const item of items) {
      departures.push({
        type: label,
        line: item?.designation ?? item?.line?.designation ?? item?.line?.name ?? "",
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
