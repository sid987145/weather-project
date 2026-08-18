"use client";

import { useEffect, useRef } from "react";
import { getAqiLevel, temperatureColor } from "../utils/dashboardUtils";

export default function CityMap({ cities, selectedCityId, onSelectCity }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const onSelectRef = useRef(onSelectCity);

  useEffect(() => {
    onSelectRef.current = onSelectCity;
  }, [onSelectCity]);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      if (containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }

      const map = L.map(containerRef.current, {
        center: [18, 8],
        zoom: 2,
        minZoom: 1,
        maxZoom: 8,
        scrollWheelZoom: true,
        worldCopyJump: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);
    }

    void setupMap();

    return () => {
      cancelled = true;
      markerLayerRef.current?.remove();
      markerLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const isInitialFitRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function renderMarkers() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || cancelled) return;

      markerLayerRef.current?.clearLayers();
      const markerLayer = markerLayerRef.current;

      cities.forEach((snapshot) => {
        const isSelected = snapshot.city.id === selectedCityId;
        const marker = L.marker([snapshot.city.latitude, snapshot.city.longitude], {
          icon: cityIcon(L, snapshot, isSelected),
        })
          .bindTooltip(`
            <div class="font-sans text-center">
              <strong class="text-sm">${snapshot.city.name}</strong><br/>
              <span class="text-xs text-slate-500">Temp: ${snapshot.weather.temperatureC !== null ? Math.round(snapshot.weather.temperatureC) + '°C' : 'N/A'}</span><br/>
              <span class="text-xs text-slate-500">AQI: ${snapshot.airQuality.usAqi ?? snapshot.airQuality.europeanAqi}</span>
            </div>
          `, { direction: 'top', offset: [0, -20], className: 'shadow-lg rounded-md px-2 py-1' })
          .on("click", () => onSelectRef.current(snapshot.city.id));
        
        marker.cityId = snapshot.city.id;
        marker.addTo(markerLayer);
      });
      
      if (!isInitialFitRef.current && cities.length > 0) {
        const bounds = L.latLngBounds(
          cities.map((snapshot) => [snapshot.city.latitude, snapshot.city.longitude])
        );
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { duration: 1.5, padding: [36, 36] });
          isInitialFitRef.current = true;
        }
      }
    }

    void renderMarkers();

    return () => {
      cancelled = true;
    };
  }, [cities, selectedCityId]);

  // Separate effect to handle flyTo when a city is selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCityId) return;

    const selectedSnapshot = cities.find((s) => s.city.id === selectedCityId);
    if (selectedSnapshot) {
      map.flyTo([selectedSnapshot.city.latitude, selectedSnapshot.city.longitude], 7, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [selectedCityId, cities]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function cityIcon(L, snapshot, selected) {
  const aqi = snapshot.airQuality.usAqi ?? snapshot.airQuality.europeanAqi;
  const level = getAqiLevel(aqi);
  const temp = snapshot.weather.temperatureC === null ? "N/A" : `${Math.round(snapshot.weather.temperatureC)}°C`;

  return L.divIcon({
    className: "city-marker-wrapper",
    html: `<div class="city-marker-pin${selected ? " is-selected" : ""}" style="--marker-color:${level.color};--marker-text:${level.textColor};"><span>${temp}</span></div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}