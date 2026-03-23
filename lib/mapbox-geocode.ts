/**
 * Mapbox Geocoding API: forward geocode (address/city → coordinates + place info).
 * Requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
 */

export type MapboxFeature = {
  id: string;
  place_name: string;
  /** Primary label for the feature (e.g. neighborhood or city name). */
  text?: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
  place_type?: string[];
};

export type MapboxGeocodeResult = {
  lat: number;
  lng: number;
  place_name: string;
  city: string | null;
};

/**
 * Name to use when matching buyer target locations.
 * Mapbox puts incorporated cities in `place.*` (e.g. Los Angeles) while the searched
 * name may be a neighborhood/locality (e.g. Tarzana). Prefer neighborhood → locality → place.
 */
function extractMatchingPlaceName(feature: MapboxFeature): string | null {
  const ctx = feature.context ?? [];

  const neighborhood = ctx.find((c) => c.id.startsWith("neighborhood."));
  if (neighborhood?.text?.trim()) return neighborhood.text.trim();

  const locality = ctx.find((c) => c.id.startsWith("locality."));
  if (locality?.text?.trim()) return locality.text.trim();

  const types = feature.place_type ?? [];
  if (types.includes("neighborhood") || types.includes("locality")) {
    const t = feature.text?.trim();
    if (t) return t;
  }

  const place = ctx.find((c) => c.id.startsWith("place."));
  if (place?.text?.trim()) return place.text.trim();

  if (types.includes("place")) {
    const t = feature.text?.trim();
    if (t) return t;
  }

  const first = feature.place_name?.split(",")[0]?.trim();
  return first || null;
}

export async function mapboxGeocode(query: string): Promise<MapboxGeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token?.trim()) return null;
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&limit=1&types=place,address,locality,neighborhood`;
  const res = await fetch(url);
  const data = (await res.json()) as { features?: MapboxFeature[] };
  const feature = data.features?.[0];
  if (!feature?.center?.length) return null;

  const [lng, lat] = feature.center;
  const city =
    extractMatchingPlaceName(feature) ??
    (feature.place_type?.includes("place") ? feature.text?.trim() ?? null : null);
  return { lat, lng, place_name: feature.place_name, city };
}

/** Geocode and return first result (for server or client with token passed). */
export async function mapboxGeocodeWithToken(query: string, accessToken: string): Promise<MapboxGeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed || !accessToken) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${accessToken}&limit=1&types=place,address,locality,neighborhood`;
  const res = await fetch(url);
  const data = (await res.json()) as { features?: MapboxFeature[] };
  const feature = data.features?.[0];
  if (!feature?.center?.length) return null;
  const [lng, lat] = feature.center;
  const city =
    extractMatchingPlaceName(feature) ??
    (feature.place_type?.includes("place") ? feature.text?.trim() ?? null : null);
  return { lat, lng, place_name: feature.place_name, city };
}
