// Simulated telemetry for the System Metrics Dashboard.
// Initial history is generated from a fixed seed so the first paint is
// stable between page loads (keeps Lighthouse runs comparable).

export const MINUTE = 60_000;
export const TICK_MS = 5_000;
const WINDOW_MS = 360 * MINUTE;

export const RANGES = [
  { id: "15m", label: "15m", minutes: 15 },
  { id: "1h", label: "1h", minutes: 60 },
  { id: "6h", label: "6h", minutes: 360 },
];

export const METRICS = [
  { id: "cpu", label: "CPU", unit: "%", digits: 0, higherIsWorse: true },
  { id: "memory", label: "Memory", unit: " GB", digits: 1, higherIsWorse: true },
  { id: "latency", label: "p95 latency", unit: " ms", digits: 0, higherIsWorse: true },
  { id: "rps", label: "Requests", unit: "/s", digits: 0, higherIsWorse: false },
  { id: "errorRate", label: "Error rate", unit: "%", digits: 2, higherIsWorse: true },
];

export function formatMetric(metric, value) {
  return value.toLocaleString("en", {
    minimumFractionDigits: metric.digits,
    maximumFractionDigits: metric.digits,
  });
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function drift(value, target, spread, min, max, random) {
  const pull = (target - value) * 0.08;
  return clamp(value + pull + (random() - 0.5) * spread, min, max);
}

export function nextPoint(previous, time, random) {
  const cpu = drift(previous.cpu, 30, 6, 6, 94, random);
  return {
    time,
    cpu,
    memory: drift(previous.memory, 3.4, 0.12, 2.2, 7.8, random),
    latency: drift(previous.latency, 40 + cpu * 0.3, 7, 15, 260, random),
    rps: drift(previous.rps, 1180, 90, 500, 2400, random),
    errorRate: drift(previous.errorRate, 0.18, 0.025, 0, 4, random),
  };
}

export function createHistory(now = Date.now(), seed = 412) {
  const random = seededRandom(seed);
  const points = [];
  let previous = { cpu: 28, memory: 3.3, latency: 48, rps: 1150, errorRate: 0.16 };
  for (let i = 360; i >= 0; i -= 1) {
    previous = nextPoint(previous, now - i * MINUTE, random);
    points.push(previous);
  }
  return points;
}

export function appendPoint(history, time = Date.now()) {
  const next = nextPoint(history[history.length - 1], time, Math.random);
  const cutoff = time - WINDOW_MS;
  const kept = history[0].time < cutoff ? history.filter((p) => p.time >= cutoff) : history;
  return [...kept, next];
}

// Picks at most `max` evenly spaced points, always keeping the last one.
export function downsample(points, max) {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

// --- Services -------------------------------------------------------------

function uptimeDays(seed, events) {
  const random = seededRandom(seed);
  return Array.from({ length: 30 }, (_, day) => {
    if (events[day]) return events[day];
    return random() < 0.015 ? "degraded" : "up";
  });
}

export const SERVICES = [
  { name: "API Gateway", detail: "18 endpoints", latencyFactor: 1, days: uptimeDays(3, { 29: "degraded" }) },
  { name: "Auth Service", detail: "OAuth and sessions", latencyFactor: 0.55, days: uptimeDays(5, { 24: "down" }) },
  { name: "Worker Cluster", detail: "12 / 12 nodes · 3 zones", latencyFactor: 2.4, days: uptimeDays(8, {}) },
  { name: "Database Primary", detail: "PostgreSQL 16", latencyFactor: 0.2, days: uptimeDays(13, {}) },
  { name: "Database Replica", detail: "Read replica · ap-south-1b", latencyFactor: 0.25, days: uptimeDays(21, { 11: "down", 29: "degraded" }) },
  { name: "CDN", detail: "Static assets", latencyFactor: 0.3, days: uptimeDays(34, {}) },
];

const DAY_UPTIME = { up: 100, degraded: 99.6, down: 97.9 };

export function uptimePercent(days) {
  const total = days.reduce((sum, day) => sum + DAY_UPTIME[day], 0);
  return total / days.length;
}

// --- Incidents ------------------------------------------------------------

export const SEVERITIES = ["Critical", "Warning", "Info"];

export function createIncidents(now = Date.now()) {
  return [
    { id: "INC-1042", severity: "Critical", service: "Database Replica", message: "Replication lag exceeded the 30-second threshold.", status: "Open", at: now - 6 * MINUTE },
    { id: "INC-1041", severity: "Warning", service: "API Gateway", message: "Elevated p95 latency in the west region.", status: "Acknowledged", at: now - 18 * MINUTE },
    { id: "INC-1040", severity: "Warning", service: "Worker Cluster", message: "Job queue depth above 500 for 5 minutes.", status: "Open", at: now - 41 * MINUTE },
    { id: "INC-1039", severity: "Info", service: "Worker Cluster", message: "Node 12 completed its scheduled maintenance.", status: "Resolved", at: now - 72 * MINUTE },
    { id: "INC-1038", severity: "Info", service: "CDN", message: "Cache purge finished for /assets/*.", status: "Resolved", at: now - 130 * MINUTE },
    { id: "INC-1037", severity: "Critical", service: "Auth Service", message: "Token refresh failures above 2% after deploy #409.", status: "Resolved", at: now - 262 * MINUTE },
    { id: "INC-1036", severity: "Warning", service: "Database Primary", message: "Connection pool at 85% capacity.", status: "Resolved", at: now - 340 * MINUTE },
  ];
}

// --- Pipeline -------------------------------------------------------------

// Sample results for the most recent quality-gate run.
export const LATEST_AUDIT = {
  performance: 0.96,
  accessibility: 0.98,
  bestPractices: 1,
  lcp: 1380,
  cls: 0.01,
  jsKb: 62.2,
  cssKb: 2.7,
};

export const PIPELINE_RUNS = [
  { id: 412, sha: "a3f9c1e", message: "Add incident filters to dashboard", branch: "dev", seconds: 201, status: "Passed", minutesAgo: 22 },
  { id: 411, sha: "7b02d4f", message: "Raise accessibility threshold to 0.90", branch: "main", seconds: 188, status: "Passed", minutesAgo: 95 },
  { id: 410, sha: "e19c8a2", message: "Inline hero image for LCP", branch: "dev", seconds: 176, status: "Failed", note: "LCP 2,910 ms > 2,500 ms", minutesAgo: 140 },
  { id: 409, sha: "c4d71b0", message: "Bump Vite to 8.3", branch: "main", seconds: 192, status: "Passed", minutesAgo: 300 },
  { id: 408, sha: "58aa3e9", message: "Split dashboard styles", branch: "dev", seconds: 169, status: "Passed", minutesAgo: 1440 },
];
