"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import type { LatLng } from "@/lib/geo/city-coords";

type Marker = LatLng & { id?: string; label?: string };

type Props = {
  center?: LatLng;
  zoom?: number;
  markers?: Marker[];
  className?: string;
  height?: number;
};

/**
 * Mapbox GL map. Requires NEXT_PUBLIC_MAPBOX_TOKEN.
 * Without a token, shows a branded placeholder (no crash).
 */
export function MapboxMap({
  center: centerProp,
  zoom = 11,
  markers = [],
  className,
  height = 280,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const center = useMemo<LatLng>(() => {
    if (centerProp) return centerProp;
    if (markers[0]) return { lat: markers[0].lat, lng: markers[0].lng };
    return { lat: 24.8607, lng: 67.0011 };
  }, [centerProp, markers]);

  const markerKey = markers.map((m) => `${m.lat},${m.lng}`).join("|");

  useEffect(() => {
    if (!token || !containerRef.current) return;

    let cancelled = false;
    let map: { remove: () => void } | null = null;

    void (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;
        const instance = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/outdoors-v12",
          center: [center.lng, center.lat],
          zoom,
        });
        map = instance;

        instance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        const pins = markers.length ? markers : [{ ...center }];
        for (const m of pins) {
          new mapboxgl.Marker({ color: "#2F5D50" })
            .setLngLat([m.lng, m.lat])
            .setPopup(
              m.label
                ? new mapboxgl.Popup({ offset: 16 }).setText(m.label)
                : undefined
            )
            .addTo(instance);
        }
      } catch (e) {
        console.error("[mapbox]", e);
        if (!cancelled) setError("Map failed to load");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, center.lat, center.lng, zoom, markerKey]);

  if (!token) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-line bg-pine-900/5 text-center",
          className
        )}
        style={{ height }}
      >
        <p className="text-sm font-semibold text-ink-700">Map preview</p>
        <p className="mt-1 text-xs text-ink-500 tabular-nums">
          {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </p>
        <p className="mt-2 max-w-xs px-4 text-xs text-ink-500">
          Set <code className="text-pine-600">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable Mapbox.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-line text-sm text-ink-500",
          className
        )}
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden rounded-md border border-line", className)}
      style={{ height }}
    />
  );
}
