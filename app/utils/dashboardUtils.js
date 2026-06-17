export function buildSummary(cities) {
  const temperatures = cities
    .map((snapshot) => snapshot.weather.temperatureC)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  const aqis = cities
    .map((snapshot) => snapshot.airQuality.usAqi)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  return {
    averageTemp:
      temperatures.length > 0
        ? temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length
        : null,
    peakAqi: aqis.length > 0 ? Math.max(...aqis) : null,
  };
}

export function getAqiLevel(aqi) {
  if (aqi === null || aqi === undefined || Number.isNaN(aqi)) {
    return { label: "Unknown", color: "#64748b", textColor: "#ffffff" };
  }
  if (aqi <= 50) return { label: "Good", color: "#16a34a", textColor: "#ffffff" };
  if (aqi <= 100) return { label: "Moderate", color: "#facc15", textColor: "#171717" };
  if (aqi <= 150) return { label: "Sensitive", color: "#f97316", textColor: "#ffffff" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#dc2626", textColor: "#ffffff" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#7c3aed", textColor: "#ffffff" };
  return { label: "Hazardous", color: "#881337", textColor: "#ffffff" };
}

export function temperatureColor(value) {
  if (value === null) return "#64748b";
  if (value < 8) return "#2563eb";
  if (value < 24) return "#16a34a";
  if (value < 34) return "#f97316";
  return "#dc2626";
}

export function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompact(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMetric(value, suffix = "", fractionDigits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)}${suffix}`;
}

export function formatDateTime(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrencyRate(code, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return `1 ${code} = N/A INR`;
  }
  return `1 ${code} = ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 4,
  }).format(value)} INR`;
}