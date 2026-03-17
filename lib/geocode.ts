/**
 * Geocoding scaffold. Uses Nominatim (no API key).
 * For production, replace with Google Maps Geocoding or similar and set GEOCODE_API_KEY.
 */

export type GeocodeResult = {
  lat: number;
  lng: number;
  display_name: string;
  address?: { city?: string; town?: string; village?: string; neighbourhood?: string; postcode?: string; state?: string };
};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`,
      { headers: { "User-Agent": "PropertyMatchmaker/1.0" } }
    );
    const data = (await res.json()) as { lat: string; lon: string; display_name: string; address?: Record<string, string> }[];
    if (!data?.length) return null;
    const first = data[0];
    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      display_name: first.display_name,
      address: first.address as GeocodeResult["address"],
    };
  } catch {
    return null;
  }
}

/** Extract city from Nominatim address object. */
export function extractCity(addr: GeocodeResult["address"]): string | null {
  if (!addr) return null;
  return addr.city ?? addr.town ?? addr.village ?? null;
}

/** Extract neighborhood. */
export function extractNeighborhood(addr: GeocodeResult["address"]): string | null {
  if (!addr) return null;
  return addr.neighbourhood ?? null;
}

/** Extract zip. */
export function extractZip(addr: GeocodeResult["address"]): string | null {
  if (!addr) return null;
  return addr.postcode ?? null;
}
