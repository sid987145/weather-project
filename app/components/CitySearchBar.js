"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

export default function CitySearchBar({ onCityTracked }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const isSelectedRef = useRef(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSelectedRef.current || !query.trim()) {
      return;
    }

    let isMounted = true;
    const fetchCities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (isMounted) {
          setSuggestions(data.cities || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch cities", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchCities, 400);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [query]);

  const handleSelectCity = async (city) => {
    isSelectedRef.current = true;
    const displayText = city.country ? `${city.name}, ${city.country}` : city.name;
    setQuery(displayText);
    setIsOpen(false);
    setTrackingId(city.id);

    try {
      // Silently track to fetch weather data
      const res = await fetch("/api/cities/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(city),
      });
      if (res.ok) {
        if (onCityTracked) onCityTracked(city.id);
      }
    } catch (error) {
      console.error("Failed to select city", error);
    } finally {
      setTrackingId(null);
    }
  };

  const handleClear = () => {
    isSelectedRef.current = false;
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search for a city anywhere in the world..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            isSelectedRef.current = false;
            setQuery(val);
            if (!val.trim()) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0 && !isSelectedRef.current) setIsOpen(true);
          }}
          className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          <ul className="max-h-60 overflow-y-auto p-1">
            {suggestions.map((city) => (
              <li
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-700/50"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
                    {city.name}
                  </span>
                  <span className="truncate text-slate-400 dark:text-slate-500 text-xs">
                    {city.country}
                  </span>
                </div>
                {trackingId === city.id && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
