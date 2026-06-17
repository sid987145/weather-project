"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, Database, Globe2, LoaderCircle, Moon, RefreshCw, Signal, Sun, Thermometer } from "lucide-react";
import { buildSummary, formatCompact, formatDateTime, formatMetric, formatNumber, getAqiLevel } from "../utils/dashboardUtils";
import CityMap from "./CityMap";
import CityModal from "./CityModal";

const POLL_MS = 30000;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Theme State Configuration
  const [theme, setTheme] = useState("light");

  // Sync theme with local storage and system configuration on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
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
    void loadDashboard("initial");
    const timer = setInterval(() => void loadDashboard("refresh"), POLL_MS);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  const selectedSnapshot = useMemo(() => 
    data?.cities?.find((s) => s.city.id === selectedCityId) ?? null, 
    [data, selectedCityId]
  );

  const summary = useMemo(() => buildSummary(data?.cities ?? []), [data]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Signal className="h-4 w-4" /> Live city data
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">Global City Insights</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Native Theme Mode Toggle Trigger Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            {[7, 15].map((val) => (
              <button key={val} type="button" onClick={() => setDays(val)} className={`rounded-md px-3 py-2 text-sm font-medium transition ${days === val ? "bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                {val} days
              </button>
            ))}
          </div>
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

      <section className="grid flex-1 gap-4 pb-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:min-h-0">
          {loading ? (
            <div className="grid h-full min-h-[420px] place-items-center">
              <div className="text-center">
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Loading map visuals...</p>
              </div>
            </div>
          ) : (
            <CityMap cities={data?.cities ?? []} selectedCityId={selectedCityId} onSelectCity={setSelectedCityId} />
          )}
        </div>

        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Cities</h2>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock3 className="h-3.5 w-3.5" /> {data ? formatDateTime(data.meta.generatedAt) : "N/A"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {(data?.cities ?? []).map((snapshot) => {
              const badgeLevel = getAqiLevel(snapshot.airQuality.usAqi);
              return (
                <button key={snapshot.city.id} type="button" onClick={() => setSelectedCityId(snapshot.city.id)} className={`w-full border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-left transition last:border-0 ${selectedCityId === snapshot.city.id ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950 dark:text-white">{snapshot.city.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{snapshot.city.country}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: badgeLevel.color, color: badgeLevel.textColor }}>
                      {snapshot.airQuality.usAqi}
                    </span>
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

      {selectedSnapshot && data && (
        <CityModal snapshot={selectedSnapshot} trends={data.trends?.[selectedSnapshot.city.id] ?? []} onClose={() => setSelectedCityId(null)} />
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