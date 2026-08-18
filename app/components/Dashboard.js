"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, Database, Globe2, LoaderCircle, Moon, RefreshCw, Signal, Sun, Thermometer, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { buildSummary, formatCompact, formatDateTime, formatMetric, formatNumber, getAqiLevel } from "../utils/dashboardUtils";
import CityMap from "./CityMap";
import CityModal from "./CityModal";
import CitySearchBar from "./CitySearchBar";

const POLL_MS = 30000;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [focusedCityId, setFocusedCityId] = useState(null);
  const [modalCityId, setModalCityId] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Theme State Configuration
  const [theme, setTheme] = useState("light");

  // Sync theme with local storage and system configuration on mount
  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      
      setTheme(isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });
  }, []);

  // Handle manual theme adjustment changes
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const loadDashboard = useCallback(async (mode = "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const response = await fetch(`/api/dashboard?days=${days}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Dashboard API returned status ${response.status}.`);
      const payload = await response.json();
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        const response = await fetch(`/api/dashboard?days=${days}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Dashboard API returned status ${response.status}.`);
        const payload = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchInitial();
    const timer = setInterval(() => {
      void loadDashboard("refresh");
    }, POLL_MS);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [days, loadDashboard]);

  const modalSnapshot = useMemo(() => 
    data?.cities?.find((s) => s.city.id === modalCityId) ?? null, 
    [data, modalCityId]
  );

  const summary = useMemo(() => buildSummary(data?.cities ?? []), [data]);

  const sortedCities = useMemo(() => {
    const cities = [...(data?.cities ?? [])];
    switch (sortBy) {
      case "Highest AQI":
        return cities.sort((a, b) => b.airQuality.usAqi - a.airQuality.usAqi);
      case "Lowest AQI":
        return cities.sort((a, b) => a.airQuality.usAqi - b.airQuality.usAqi);
      case "Highest Temp":
        return cities.sort((a, b) => b.weather.temperatureC - a.weather.temperatureC);
      case "Lowest Temp":
        return cities.sort((a, b) => a.weather.temperatureC - b.weather.temperatureC);
      case "Name (A-Z)":
      default:
        return cities.sort((a, b) => a.city.name.localeCompare(b.city.name));
    }
  }, [data, sortBy]);

  return (
    <div className="mx-auto flex min-h-screen lg:h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Signal className="h-4 w-4" /> Live city data
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">Global City Insights</h1>
        </div>

        <div className="flex-1 w-full max-w-lg mx-4 z-50">
          <CitySearchBar onCityTracked={(id) => {
            loadDashboard("refresh").then(() => {
              if (id) setFocusedCityId(id);
            });
          }} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
          )}

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            {[7, 15].map((val) => (
              <button key={val} type="button" onClick={() => setDays(val)} className={`rounded-md px-3 py-2 text-sm font-medium transition active:scale-95 ${days === val ? "bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                {val} days
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>

          <button type="button" onClick={() => void loadDashboard("refresh")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-900 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <section className="grid gap-3 py-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryTile icon={<Globe2 className="h-4 w-4" />} label="Cities" value={String(data?.cities?.length ?? 10)} />
        <SummaryTile icon={<Thermometer className="h-4 w-4" />} label="Avg temp" value={formatMetric(summary.averageTemp, "°C", 1)} />
        <SummaryTile icon={<Signal className="h-4 w-4" />} label="Peak AQI" value={formatMetric(summary.peakAqi, "", 0)} />
        </section>

      <section className="grid flex-1 min-h-0 gap-4 pb-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:min-h-0">
          {loading ? (
            <div className="grid h-full min-h-[420px] place-items-center">
              <div className="text-center">
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Loading map visuals...</p>
              </div>
            </div>
          ) : (
            <CityMap 
              cities={data?.cities ?? []} 
              selectedCityId={focusedCityId} 
              onSelectCity={(id) => {
                setFocusedCityId(id);
                setModalCityId(id);
              }} 
            />
          )}
        </div>

        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Cities</h2>
            
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Sort: {sortBy} <ChevronDown className="h-3 w-3" />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                  {["Name (A-Z)", "Highest AQI", "Lowest AQI", "Highest Temp", "Lowest Temp"].map(option => (
                    <button
                      key={option}
                      className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {sortedCities.map((snapshot) => {
              const badgeLevel = getAqiLevel(snapshot.airQuality.usAqi);
              return (
                <button key={snapshot.city.id} type="button" onClick={() => setFocusedCityId(snapshot.city.id)} className={`w-full border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-left transition last:border-0 ${focusedCityId === snapshot.city.id ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}>
                  <div className="flex items-start justify-between gap-3 group">
                    <div>
                      <p className="font-medium text-slate-950 dark:text-white">{snapshot.city.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{snapshot.city.country}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: badgeLevel.color, color: badgeLevel.textColor }}>
                        {snapshot.airQuality.usAqi}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <MiniMetric label="Temp" value={formatMetric(snapshot.weather.temperatureC, "°C", 1)} />
                    <MiniMetric label="Pop." value={formatCompact(snapshot.population.value)} />
                    <MiniMetric label={snapshot.currency.code} value={snapshot.currency.inrPerCurrencyUnit ? formatNumber(snapshot.currency.inrPerCurrencyUnit) : "N/A"} />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </section>

      {modalSnapshot && data && (
        <CityModal snapshot={modalSnapshot} trends={data.trends?.[modalSnapshot.city.id] ?? []} onClose={() => setModalCityId(null)} />
      )}
    </div>
  );
}

function SummaryTile({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {icon} {label}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div>
      <p className="font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}