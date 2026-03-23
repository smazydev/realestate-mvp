"use client";

import { useEffect, useRef, useState } from "react";

type LatLng = [number, number]; // [lat, lng] for our app; mapbox uses [lng, lat]

type Props = {
  center?: LatLng | null;
  zoom?: number;
  marker?: LatLng | null;
  className?: string;
};

const DEFAULT_CENTER: LatLng = [34.0522, -118.2437];
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapboxMap({ center, zoom = 10, marker, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveCenter = center ?? DEFAULT_CENTER;
  const [lat, lng] = effectiveCenter;
  const mLat = marker?.[0];
  const mLng = marker?.[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || !MAPBOX_TOKEN) {
      if (!MAPBOX_TOKEN) setError("Mapbox token not configured");
      return;
    }

    import("mapbox-gl").then((mapboxgl) => {
      if (!containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      (mapboxgl.default as unknown as { accessToken?: string }).accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [lng, lat],
        zoom,
      });

      map.addControl(new mapboxgl.default.NavigationControl(), "top-right");

      mapRef.current = map;

      if (mLat != null && mLng != null) {
        const el = document.createElement("div");
        el.className = "mapbox-marker-pin";
        el.innerHTML = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#F97316"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `;
        const mbMarker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([mLng, mLat])
          .addTo(map);
        markerRef.current = mbMarker;
      }
    }).catch(() => setError("Map failed to load"));

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- create map once on mount; center/marker updates in next effect
  }, [mounted]);

  // Update map center/marker when props change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([lng, lat]);
    mapRef.current.setZoom(zoom ?? 10);
    if (markerRef.current) {
      if (mLat != null && mLng != null) {
        markerRef.current.setLngLat([mLng, mLat]);
        markerRef.current.addTo(mapRef.current);
      } else {
        markerRef.current.remove();
        markerRef.current = null;
      }
    } else if (mLat != null && mLng != null) {
      import("mapbox-gl").then((mapboxgl) => {
        if (!mapRef.current) return;
        const el = document.createElement("div");
        el.className = "mapbox-marker-pin";
        el.innerHTML = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#F97316"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `;
        const mbMarker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([mLng, mLat])
          .addTo(mapRef.current);
        markerRef.current = mbMarker;
      });
    }
  }, [lng, lat, zoom, mLat, mLng]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex min-h-[300px] items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${className}`}>
        Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to use the map.
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-[300px] items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${className}`}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={`min-h-[300px] w-full rounded-lg ${className}`} />;
}
