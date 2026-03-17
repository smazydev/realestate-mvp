"use client";

import { useEffect, useRef, useState } from "react";

type LatLngTuple = [number, number];

type Props = {
  center?: LatLngTuple | null;
  zoom?: number;
  marker?: LatLngTuple | null;
  className?: string;
};

const DEFAULT_CENTER: LatLngTuple = [34.0522, -118.2437];

export function SimpleMap({ center, zoom = 10, marker, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const [mounted, setMounted] = useState(false);
  const effectiveCenter = center ?? DEFAULT_CENTER;

  useEffect(() => {
    setMounted(true);
  }, []);

  const c0 = effectiveCenter[0];
  const c1 = effectiveCenter[1];
  const m0 = marker?.[0];
  const m1 = marker?.[1];

  useEffect(() => {
    if (!mounted || !containerRef.current || typeof window === "undefined") return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const viewCenter: [number, number] = [c0, c1];
    const viewZoom = zoom;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      const map = L.default.map(containerRef.current).setView(viewCenter, viewZoom);
      mapRef.current = map;
      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      if (m0 != null && m1 != null) {
        L.default.marker([m0, m1]).addTo(map);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted, c0, c1, zoom, m0, m1]);

  return <div ref={containerRef} className={`min-h-[300px] w-full rounded-lg ${className}`} />;
}
