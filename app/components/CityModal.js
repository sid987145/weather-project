"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Banknote, Clock3, Database, Gauge, MapPin, Users, Wind, X, Loader2, CalendarDays } from "lucide-react";
import { formatCurrencyRate, formatDateTime, formatMetric, formatNumber, getAqiLevel } from "../utils/dashboardUtils";
import { TemperatureGauge, TrendChart } from "./Charts";

export default function CityModal({ snapshot, trends, onClose }) {
  const [forecast, setForecast] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(true);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoadingForecast(true);
      try {
        const res = await fetch(`/api/forecast?lat=${snapshot.city.latitude}&lon=${snapshot.city.longitude}`);
        if (res.ok) {
          const data = await res.json();
          setForecast(data.forecast || []);
        }
      } catch (err) {
        console.error("Failed to fetch forecast", err);
      } finally {
        setLoadingForecast(false);
      }
    };
    fetchForecast();
  }, [snapshot.city.latitude, snapshot.city.longitude]);

  const rows = [
    ["Temperature", formatMetric(snapshot.weather.temperatureC, "°C", 1)],
    ["Feels like", formatMetric(snapshot.weather.apparentTemperatureC, "°C", 1)],
    ["Humidity", formatMetric(snapshot.weather.humidityPercent, "%", 0)],
    ["Wind", formatMetric(snapshot.weather.windKph, " km/h", 1)],
    ["Condition", snapshot.weather.condition],
    ["US AQI", formatMetric(snapshot.airQuality.usAqi, "", 0)],
    ["European AQI", formatMetric(snapshot.airQuality.europeanAqi, "", 0)],
    ["PM2.5", formatMetric(snapshot.airQuality.pm25, " μg/m³", 1)],
    ["PM10", formatMetric(snapshot.airQuality.pm10, " μg/m³", 1)],
    ["Nitrogen dioxide", formatMetric(snapshot.airQuality.nitrogenDioxide, " μg/m³", 1)],
    ["Ozone", formatMetric(snapshot.airQuality.ozone, " μg/m³", 1)],
    ["Carbon monoxide", formatMetric(snapshot.airQuality.carbonMonoxide, " μg/m³", 0)],
    ["Population", formatNumber(snapshot.population.value)],
    ["Currency", formatCurrencyRate(snapshot.currency.code, snapshot.currency.inrPerCurrencyUnit)],
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6 flex items-center justify-center">
      <div role="dialog" aria-modal="true" className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-950">{snapshot.city.name}</h2>
              <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: getAqiLevel(snapshot.airQuality.usAqi).color, color: getAqiLevel(snapshot.airQuality.usAqi).textColor }}>
                {snapshot.airQuality.usAqi} {getAqiLevel(snapshot.airQuality.usAqi).label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {snapshot.city.country}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" title="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-5">
              <TemperatureGauge value={snapshot.weather.temperatureC} apparentValue={snapshot.weather.apparentTemperatureC} />
              <div className="grid grid-cols-2 gap-3">
                <MetricTile icon={<Wind className="h-4 w-4" />} label="Wind" value={formatMetric(snapshot.weather.windKph, " km/h", 1)} />
                <MetricTile icon={<Gauge className="h-4 w-4" />} label="PM2.5" value={formatMetric(snapshot.airQuality.pm25, " μg/m³", 1)} />
                <MetricTile icon={<Users className="h-4 w-4" />} label="Population" value={formatNumber(snapshot.population.value)} />
                <MetricTile icon={<Banknote className="h-4 w-4" />} label={snapshot.currency.code} value={formatCurrencyRate(snapshot.currency.code, snapshot.currency.inrPerCurrencyUnit)} />
              </div>
              <div className="rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  Last updated
                </div>
                <div className="space-y-2 px-4 py-3 text-sm text-slate-600">
                  <p>Snapshot: {formatDateTime(snapshot.updatedAt)}</p>
                  <p>Weather: {formatDateTime(snapshot.weather.observedAt)}</p>
                  <p>Air quality: {formatDateTime(snapshot.airQuality.observedAt)}</p>
                  <p>FX rates: {formatDateTime(snapshot.currency.updatedAt)}</p>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Database className="h-4 w-4 text-slate-500" />
                  Metrics
                </div>
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {rows.map(([label, value]) => (
                        <tr key={label} className="border-b border-slate-200 last:border-0">
                          <th className="w-2/5 bg-slate-50 px-3 py-2 font-medium text-slate-500">{label}</th>
                          <td className="px-3 py-2 text-slate-800">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  5-Day Forecast
                </div>
                {loadingForecast ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : forecast.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {forecast.map((day) => (
                      <div key={day.date} className="flex flex-col items-center justify-between rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                        <span className="text-xs font-semibold text-slate-600">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <Image
                          src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                          alt={day.condition || "Weather icon"}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 drop-shadow-sm"
                        />
                        <div className="flex w-full items-center justify-center gap-1.5 text-xs">
                          <span className="font-bold text-slate-900">{Math.round(day.temp_max)}°</span>
                          <span className="text-slate-400">{Math.round(day.temp_min)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No forecast available.</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-950 mb-3">Trend (Temp & AQI)</h3>
                <TrendChart points={trends} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}