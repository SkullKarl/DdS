const GOOGLE_MAPS_API_KEY = "api_key"; 

export async function getCoordinatesFromAddress(address: string) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      console.warn("No se pudo obtener la ubicación:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener coordenadas:", error);
    return null;
  }
}
