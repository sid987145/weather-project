"use client";

import { Thermometer } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMetric, formatTime, temperatureColor } from "../utils/dashboardUtils";

export function TemperatureGauge({ value, apparentValue }) {
  const min = -10;
  const max = 45;
  const normalized = value === null ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const color = temperatureColor(value);
  const degrees = Math.round(normalized * 360);

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${degrees}deg, #e5e7eb ${degrees}deg)`,
        }}
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center shadow-sm">
          <Thermometer className="mx-auto h-4 w-4 text-slate-500" />
          <span className="text-xl font-semibold text-slate-950">
            {formatMetric(value, "°C", 1)}
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Temperature
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Feels like {formatMetric(apparentValue, "°C", 1)}
        </p>
      </div>
    </div>
  );
}

export function TrendChart({ points }) {
  const data = points.map((point) => ({
    ...point,
    label: formatTime(point.time),
  }));

  if (data.length < 2) {
    return (
      <div className="grid h-48 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Trend samples are being collected
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#cbd5e1",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
            }}
          />
          <Line yAxisId="left" type="monotone" dataKey="temperatureC" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
          <Line yAxisId="right" type="monotone" dataKey="usAqi" stroke="#dc2626" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}