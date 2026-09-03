"use client";

import { useEffect, useRef } from "react";
import type { Stage2Place } from "../lib/stage2-api";

type LeafletApi = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => any;
  tileLayer: (url: string, options?: Record<string, unknown>) => any;
  circleMarker: (coords: [number, number], options?: Record<string, unknown>) => any;
  circle: (coords: [number, number], options?: Record<string, unknown>) => any;
  marker: (coords: [number, number], options?: Record<string, unknown>) => any;
  icon: (options?: Record<string, unknown>) => any;
};

declare global {
  interface Window {
    L?: LeafletApi;
    __gidLeafletPromise?: Promise<LeafletApi>;
    google?: any;
    __gidGoogleMapsPromise?: Promise<any>;
  }
}

function browserMapsKey() {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

function loadGoogleMaps(): Promise<any> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__gidGoogleMapsPromise) return window.__gidGoogleMapsPromise;
  const key = browserMapsKey();
  if (!key) return Promise.reject(new Error("Google Maps browser key is not configured"));
  window.__gidGoogleMapsPromise = new Promise((resolve, reject) => {
    const callback = `__gidGoogleMapsReady_${Date.now()}`;
    (window as any)[callback] = () => {
      delete (window as any)[callback];
      window.google?.maps ? resolve(window.google.maps) : reject(new Error("Google Maps did not initialize"));
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly&loading=async&callback=${callback}`;
    script.async = true;
    script.defer = true;
    script.dataset.gidGoogleMaps = "1";
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return window.__gidGoogleMapsPromise;
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

function markerColor(place: Stage2Place) {
  const category = String(place.category_slug || "").toLowerCase();
  if (category === "food") return "#f28a22";
  if (category === "shop") return "#2878d8";
  if (category === "nature") return "#18a45b";
  if (category === "rest") return "#8b5bd6";
  if (category === "entertainment" || category === "fun") return "#d94c65";
  if (category === "transfer") return "#159a9a";
  if (category === "useful" || category === "emergency") return "#d5a11e";
  if (category === "interesting") return "#8a67c7";
  return "#64748b";
}

function placeMarkerSvg(place: Stage2Place) {
  const partner = place.is_partner === true || place.source === "partner" || place.attributes?.partner === true;
  const fill = markerColor(place);
  const center = partner
    ? `<path d='M16 7l2.4 4.8 5.3.8-3.9 3.8.9 5.3-4.7-2.5-4.7 2.5.9-5.3-3.9-3.8 5.3-.8z' fill='white'/>`
    : `<circle cx='16' cy='16' r='4.5' fill='white'/>`;
  const outer = partner ? `<circle cx='16' cy='15' r='13' fill='none' stroke='white' stroke-width='2.3' opacity='.95'/>` : "";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='38' viewBox='0 0 32 38'><path d='M16 1C8.3 1 2 7.2 2 15c0 10.4 14 22 14 22s14-11.6 14-22C30 7.2 23.7 1 16 1z' fill='${fill}' stroke='white' stroke-width='2'/>${outer}${center}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function RealMap({
  center,
  places,
  radius = 500,
  className = "",
  onSelect,
  onPick,
  pickable = false,
  compact = false,
  preferLeaflet = false,
}: {
  center: { lat: number; lng: number };
  places: Stage2Place[];
  radius?: number;
  className?: string;
  onSelect?: (place: Stage2Place) => void;
  onPick?: (coords: { lat: number; lng: number }) => void;
  pickable?: boolean;
  compact?: boolean;
  /** Use OpenStreetMap/Leaflet first. Useful for the admin point picker so it works even when a browser Google key is restricted. */
  preferLeaflet?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    cleanupRef.current?.();
    cleanupRef.current = null;

    const renderGoogle = async () => {
      const maps = await loadGoogleMaps();
      if (cancelled || !ref.current) return;
      const zoom = compact ? 15 : radius <= 500 ? 16 : radius <= 1000 ? 15 : radius <= 2000 ? 14 : 13;
      const map = new maps.Map(ref.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom,
        disableDefaultUI: true,
        gestureHandling: compact ? "none" : "greedy",
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // Keep only Gid Tourist markers/filters visible; hide Google's own POI layer so it never competes with our approved categories.
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ],
      });
      const circle = compact ? null : new maps.Circle({ map, center, radius, strokeColor: "#13a55b", strokeOpacity: .38, strokeWeight: 1, fillColor: "#13a55b", fillOpacity: .04 });
      const user = new maps.Marker({
        map,
        position: center,
        title: "Ваше місцезнаходження",
        zIndex: 1000,
        icon: { path: maps.SymbolPath.CIRCLE, scale: compact ? 5 : 7, fillColor: "#1677ff", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 },
      });
      let pickedMarker: any = null;
      if (pickable && !compact) {
        map.addListener("click", (event: any) => {
          const lat = Number(event.latLng?.lat?.() ?? 0);
          const lng = Number(event.latLng?.lng?.() ?? 0);
          if (!lat || !lng) return;
          pickedMarker?.setMap(null);
          pickedMarker = new maps.Marker({ map, position: { lat, lng }, title: "Обрана точка", zIndex: 1200 });
          onPick?.({ lat, lng });
        });
      }
      const markers = places.slice(0, compact ? 8 : 40).map((place) => {
        const partner = place.is_partner === true || place.source === "partner" || place.attributes?.partner === true;
        const marker = new maps.Marker({
          map,
          position: { lat: Number(place.lat), lng: Number(place.lng) },
          title: partner ? `Партнер · ${place.name}` : place.name,
          zIndex: partner ? 500 : 100,
          icon: { url: placeMarkerSvg(place), scaledSize: new maps.Size(compact ? 21 : 28, compact ? 25 : 33), anchor: new maps.Point(compact ? 10 : 14, compact ? 24 : 32) },
        });
        if (!compact) marker.addListener("click", () => onSelect?.(place));
        return marker;
      });
      cleanupRef.current = () => {
        user.setMap(null); pickedMarker?.setMap(null); markers.forEach((marker: any) => marker.setMap(null)); circle?.setMap(null);
      };
    };

    const renderFallback = async () => {
      const L = await loadLeaflet();
      if (cancelled || !ref.current) return;
      const map = L.map(ref.current, { zoomControl: false, attributionControl: !compact, dragging: !compact, scrollWheelZoom: !compact }).setView([center.lat, center.lng], compact ? 15 : radius <= 500 ? 16 : radius <= 1000 ? 15 : 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map);
      if (!compact) L.circle([center.lat, center.lng], { radius, color: "#20b364", weight: 1, opacity: 0.35, fillOpacity: 0.04 }).addTo(map);
      L.circleMarker([center.lat, center.lng], { radius: compact ? 5 : 8, color: "#ffffff", weight: 3, fillColor: "#1677ff", fillOpacity: 1 }).addTo(map).bindTooltip("Ваше місцезнаходження");
      let picked: any = null;
      if (pickable && !compact) {
        map.on("click", (event: any) => {
          const lat = Number(event.latlng?.lat ?? 0);
          const lng = Number(event.latlng?.lng ?? 0);
          if (!lat || !lng) return;
          if (picked) map.removeLayer(picked);
          picked = L.circleMarker([lat, lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#111827", fillOpacity: 1 }).addTo(map);
          onPick?.({ lat, lng });
        });
      }
      for (const place of places.slice(0, compact ? 8 : 40)) {
        const partner = place.is_partner === true || place.source === "partner" || place.attributes?.partner === true;
        const icon = L.icon({ iconUrl: placeMarkerSvg(place), iconSize: compact ? [21,25] : [28,33], iconAnchor: compact ? [10,24] : [14,32] });
        const marker = L.marker([Number(place.lat), Number(place.lng)], { icon }).addTo(map);
        marker.bindTooltip(partner ? `★ Партнер · ${place.name}` : place.name);
        if (!compact) marker.on("click", () => onSelect?.(place));
      }
      setTimeout(() => map.invalidateSize(), 50);
      cleanupRef.current = () => map.remove();
    };

    if (preferLeaflet) {
      void renderFallback().catch(() => renderGoogle().catch(() => undefined));
    } else {
      void renderGoogle().catch(() => renderFallback().catch(() => undefined));
    }
    return () => { cancelled = true; cleanupRef.current?.(); cleanupRef.current = null; };
  }, [center.lat, center.lng, radius, places, onSelect, onPick, pickable, compact, preferLeaflet]);

  return <div ref={ref} className={`gt-real-map ${className}`.trim()} aria-label="Інтерактивна карта" />;
}
