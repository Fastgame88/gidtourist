"use client";

import { useEffect, useRef } from "react";
import type { Stage2Place } from "../lib/stage2-api";

type LeafletApi = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => any;
  tileLayer: (url: string, options?: Record<string, unknown>) => any;
  circleMarker: (coords: [number, number], options?: Record<string, unknown>) => any;
  circle: (coords: [number, number], options?: Record<string, unknown>) => any;
};

declare global {
  interface Window { L?: LeafletApi; __gidLeafletPromise?: Promise<LeafletApi>; }
}

function loadLeaflet(): Promise<LeafletApi> {
  if (window.L) return Promise.resolve(window.L);
  if (window.__gidLeafletPromise) return window.__gidLeafletPromise;
  window.__gidLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-gid-leaflet="1"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.gidLeaflet = "1";
      document.head.appendChild(link);
    }
    const existing = document.querySelector('script[data-gid-leaflet="1"]') as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.dataset.gidLeaflet = "1";
      document.head.appendChild(script);
    }
    const done = () => window.L ? resolve(window.L) : reject(new Error("Leaflet did not initialize"));
    if (window.L) done();
    else {
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", () => reject(new Error("Failed to load Leaflet")), { once: true });
    }
  });
  return window.__gidLeafletPromise;
}

export function RealMap({
  center,
  places,
  radius = 500,
  className = "",
  onSelect,
}: {
  center: { lat: number; lng: number };
  places: Stage2Place[];
  radius?: number;
  className?: string;
  onSelect?: (place: Stage2Place) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void loadLeaflet().then((L) => {
      if (cancelled || !ref.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(ref.current, { zoomControl: false, attributionControl: true }).setView([center.lat, center.lng], radius <= 500 ? 16 : radius <= 1000 ? 15 : 14);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.circle([center.lat, center.lng], { radius, color: "#20b364", weight: 1, opacity: 0.35, fillOpacity: 0.04 }).addTo(map);
      L.circleMarker([center.lat, center.lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#20b364", fillOpacity: 1 }).addTo(map).bindTooltip("Ваша точка");
      for (const place of places) {
        const marker = L.circleMarker([Number(place.lat), Number(place.lng)], { radius: 7, color: "#ffffff", weight: 2, fillColor: "#1d8f56", fillOpacity: 1 }).addTo(map);
        marker.bindTooltip(place.name);
        marker.on("click", () => onSelect?.(place));
      }
      setTimeout(() => map.invalidateSize(), 50);
      cleanup = () => map.remove();
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      cleanup?.();
      mapRef.current = null;
    };
  }, [center.lat, center.lng, radius, places, onSelect]);

  return <div ref={ref} className={`gt-real-map ${className}`.trim()} aria-label="Інтерактивна карта OpenStreetMap" />;
}
