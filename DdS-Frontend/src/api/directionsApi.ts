const GOOGLE_MAPS_APIKEY = "AIzaSyAl55pXyc10sWQ49ttxwRaRpaoQoP1Wbqs";

const BASE_URL = "https://maps.googleapis.com/maps/api/directions/json";

export async function getDirections(
  origin,
  destination,
  waypoints = [],
  mode = "driving"
) {
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;
  const waypointsStr =
    waypoints.length > 0
      ? `&waypoints=optimize:true|${waypoints
          .map((p) => `${p.latitude},${p.longitude}`)
          .join("|")}`
      : "";

  const url = `${BASE_URL}?origin=${originStr}&destination=${destinationStr}${waypointsStr}&mode=${mode}&key=${GOOGLE_MAPS_APIKEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("obteniendo direcciones:", error);
    throw error;
  }
}
