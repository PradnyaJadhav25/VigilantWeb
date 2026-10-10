import { useEffect, useMemo, useState } from "react";
import vigilantConfig from "../.vigilantrc.json";
import packageJson from "../package.json";
import { LineChart, Sparkline, UptimeBar } from "./components/Charts.jsx";
import {
  LATEST_AUDIT,
  METRICS,
  PIPELINE_RUNS,
  RANGES,
  SERVICES,
  SEVERITIES,
  TICK_MS,
  appendPoint,
  createHistory,
  createIncidents,
  downsample,
  formatMetric,
  uptimePercent,
} from "./data.js";
import "./styles/dashboard.css";

const clock = new Intl.DateTimeFormat("en", { timeStyle: "medium", hour12: false });

function timeAgo(from, to) {
  const minutes = Math.max(0, Math.round((to - from) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const NEXT_STATUS = { Open: "Acknowledged", Acknowledged: "Resolved" };
const ACTION_LABEL = { Open: "Acknowledge", Acknowledged: "Resolve" };
const SEVERITY_RANK = { Critical: 2, Warning: 1, Info: 0 };

function buildGates() {
  const a = vigilantConfig.ci.assert.assertions;
  const [jsLimit, cssLimit] = packageJson["size-limit"].map((entry) => parseFloat(entry.limit));
  const score = (key) => a[key][1].minScore * 100;
  return [
    { label: "Performance", target: `≥ ${score("categories:performance")}`, value: Math.round(LATEST_AUDIT.performance * 100), pass: LATEST_AUDIT.performance * 100 >= score("categories:performance") },
    { label: "Accessibility", target: `≥ ${score("categories:accessibility")}`, value: Math.round(LATEST_AUDIT.accessibility * 100), pass: LATEST_AUDIT.accessibility * 100 >= score("categories:accessibility") },
    { label: "Best practices", target: `≥ ${score("categories:best-practices")}`, value: Math.round(LATEST_AUDIT.bestPractices * 100), pass: LATEST_AUDIT.bestPractices * 100 >= score("categories:best-practices") },
    { label: "LCP", target: `≤ ${a["largest-contentful-paint"][1].maxNumericValue.toLocaleString("en")} ms`, value: `${LATEST_AUDIT.lcp.toLocaleString("en")} ms`, pass: LATEST_AUDIT.lcp <= a["largest-contentful-paint"][1].maxNumericValue },
    { label: "CLS", target: `≤ ${a["cumulative-layout-shift"][1].maxNumericValue}`, value: LATEST_AUDIT.cls.toFixed(2), pass: LATEST_AUDIT.cls <= a["cumulative-layout-shift"][1].maxNumericValue },
    { label: "JS bundle", target: `≤ ${jsLimit} KB`, value: `${LATEST_AUDIT.jsKb} KB`, pass: LATEST_AUDIT.jsKb <= jsLimit },
    { label: "CSS bundle", target: `≤ ${cssLimit} KB`, value: `${LATEST_AUDIT.cssKb} KB`, pass: LATEST_AUDIT.cssKb <= cssLimit },
  ];
}

const GATES = buildGates();

function downloadCsv(rows) {
  const header = ["id", "severity", "service", "message", "status", "opened"];
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = rows.map((r) => [r.id, r.severity, r.service, r.message, r.status, new Date(r.at).toISOString()].map(escape).join(","));
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vigilantweb-incidents.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function VigilantDashboard() {
  const [history, setHistory] = useState(() => createHistory());
  const [incidents, setIncidents] = useState(() => createIncidents());
  const [rangeId, setRangeId] = useState("1h");
  const [metricId, setMetricId] = useState("latency");
  const [live, setLive] = useState(true);
  const [severity, setSeverity] = useState("All");
  const [query, setQuery] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!live) return undefined;
    const timer = window.setInterval(() => setHistory((h) => appendPoint(h)), TICK_MS);
    return () => window.clearInterval(timer);
  }, [live]);

  const now = history[history.length - 1].time;
  const range = RANGES.find((r) => r.id === rangeId);
  const metric = METRICS.find((m) => m.id === metricId);
  const visible = useMemo(() => {
    const cutoff = now - range.minutes * 60_000;
    return history.filter((p) => p.time >= cutoff);
  }, [history, now, range]);
  const sparkPoints = useMemo(() => downsample(visible, 40), [visible]);
  const latest = visible[visible.length - 1];
  const first = visible[0];

  const openIncidents = incidents.filter((i) => i.status !== "Resolved");
  const worstOpen = openIncidents.reduce((worst, i) => Math.max(worst, SEVERITY_RANK[i.severity]), -1);
  const overall =
    worstOpen === 2
      ? { tone: "critical", text: "Degraded performance" }
      : worstOpen === 1
        ? { tone: "warning", text: "Minor issues" }
        : { tone: "ok", text: "All systems operational" };

  const filtered = incidents
    .filter((i) => showResolved || i.status !== "Resolved")
    .filter((i) => severity === "All" || i.severity === severity)
    .filter((i) => {
      const q = query.trim().toLowerCase();
      return !q || `${i.id} ${i.service} ${i.message}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.at - a.at);

  function serviceStatus(name) {
    const rank = openIncidents
      .filter((i) => i.service === name)
      .reduce((worst, i) => Math.max(worst, SEVERITY_RANK[i.severity]), -1);
    if (rank === 2) return { tone: "critical", text: "Degraded" };
    if (rank === 1) return { tone: "warning", text: "Elevated" };
    return { tone: "ok", text: "Operational" };
  }

  function refresh() {
    setHistory((h) => appendPoint(h));
    setAnnouncement(`Telemetry refreshed at ${clock.format(new Date())}.`);
  }

  function advance(id) {
    setIncidents((list) => list.map((i) => (i.id === id ? { ...i, status: NEXT_STATUS[i.status] } : i)));
    const incident = incidents.find((i) => i.id === id);
    setAnnouncement(`${id} marked ${NEXT_STATUS[incident.status].toLowerCase()}.`);
  }

  const lastRun = PIPELINE_RUNS[0];
  const gatesPassed = GATES.filter((g) => g.pass).length;

  return (
    <main className="vw">
      <div className="vw-shell">
        <header className="vw-header">
          <div className="vw-brand">
            <h1>VigilantWeb</h1>
            <p className="vw-status">
              <span className={`vw-dot vw-tone-${overall.tone}`} aria-hidden="true" />
              {overall.text}
              <span className="vw-muted"> · {openIncidents.length} open incident{openIncidents.length === 1 ? "" : "s"}</span>
            </p>
          </div>

          <div className="vw-toolbar">
            <div className="vw-segmented" role="group" aria-label="Time range">
              {RANGES.map((r) => (
                <button key={r.id} type="button" aria-pressed={r.id === rangeId} onClick={() => setRangeId(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" className="vw-btn" aria-pressed={live} onClick={() => setLive((v) => !v)}>
              <span className={`vw-dot ${live ? "vw-dot-live" : "vw-dot-paused"}`} aria-hidden="true" />
              {live ? "Live" : "Paused"}
            </button>
            <button type="button" className="vw-btn" onClick={refresh}>
              Refresh
            </button>
            <time className="vw-muted vw-time" dateTime={new Date(now).toISOString()}>
              {clock.format(now)}
            </time>
          </div>
        </header>

        <p className="vw-visually-hidden" aria-live="polite">
          {announcement}
        </p>

        <section aria-label="Key metrics">
          <div className="vw-kpis">
            {METRICS.map((m) => {
              const change = first[m.id] ? ((latest[m.id] - first[m.id]) / first[m.id]) * 100 : 0;
              const worse = m.higherIsWorse ? change > 2 : change < -2;
              const better = m.higherIsWorse ? change < -2 : change > 2;
              return (
                <button
                  key={m.id}
                  type="button"
                  className="vw-kpi"
                  aria-pressed={m.id === metricId}
                  onClick={() => setMetricId(m.id)}
                >
                  <span className="vw-label">{m.label}</span>
                  <span className="vw-kpi-value">
                    {formatMetric(m, latest[m.id])}
                    <small>{m.unit.trim()}</small>
                  </span>
                  <span className={`vw-delta ${worse ? "vw-tone-warning" : better ? "vw-tone-ok" : "vw-muted"}`}>
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                    <span className="vw-visually-hidden"> over {range.label}</span>
                  </span>
                  <Sparkline values={sparkPoints.map((p) => p[m.id])} />
                </button>
              );
            })}
          </div>
        </section>

        <div className="vw-grid">
          <section className="vw-section" aria-labelledby="trend-title">
            <div className="vw-section-head">
              <h2 id="trend-title">{metric.label}</h2>
              <span className="vw-muted">Last {range.label} · markers show incidents</span>
            </div>
            <LineChart points={visible} metric={metric} markers={incidents} />
          </section>

          <section className="vw-section" aria-labelledby="services-title">
            <div className="vw-section-head">
              <h2 id="services-title">Services</h2>
              <span className="vw-muted">30-day uptime</span>
            </div>
            <ul className="vw-services">
              {SERVICES.map((s) => {
                const status = serviceStatus(s.name);
                const uptime = uptimePercent(s.days);
                return (
                  <li key={s.name}>
                    <div className="vw-service-row">
                      <span className={`vw-dot vw-tone-${status.tone}`} aria-hidden="true" />
                      <span className="vw-service-name">{s.name}</span>
                      <span className={`vw-service-state vw-tone-${status.tone}`}>{status.text}</span>
                      <span className="vw-num">{Math.round(latest.latency * s.latencyFactor)} ms</span>
                    </div>
                    <div className="vw-service-meta">
                      <span className="vw-muted">{s.detail}</span>
                      <span className="vw-num vw-muted">{uptime.toFixed(2)}%</span>
                    </div>
                    <UptimeBar days={s.days} label={`${s.name} uptime over 30 days: ${uptime.toFixed(2)}%`} />
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="vw-grid vw-grid-even">
          <section className="vw-section" aria-labelledby="gate-title">
            <div className="vw-section-head">
              <h2 id="gate-title">Quality gate</h2>
              <span className="vw-muted">
                Run #{lastRun.id} · {gatesPassed}/{GATES.length} passing
              </span>
            </div>
            <table className="vw-table vw-gates">
              <caption className="vw-visually-hidden">Latest quality gate results against configured thresholds</caption>
              <thead>
                <tr>
                  <th scope="col">Check</th>
                  <th scope="col">Threshold</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {GATES.map((g) => (
                  <tr key={g.label}>
                    <th scope="row">{g.label}</th>
                    <td className="vw-muted vw-num">{g.target}</td>
                    <td className="vw-num">
                      <span className={g.pass ? "vw-tone-ok" : "vw-tone-critical"}>{g.pass ? "✓" : "✕"}</span> {g.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="vw-section" aria-labelledby="runs-title">
            <div className="vw-section-head">
              <h2 id="runs-title">Pipeline runs</h2>
              <span className="vw-muted">audit-pipeline.yml</span>
            </div>
            <ol className="vw-runs">
              {PIPELINE_RUNS.map((run) => (
                <li key={run.id}>
                  <span className={`vw-dot vw-tone-${run.status === "Passed" ? "ok" : "critical"}`} aria-hidden="true" />
                  <div className="vw-run-main">
                    <span className="vw-run-title">{run.message}</span>
                    <span className="vw-muted">
                      #{run.id} · <code>{run.sha}</code> · {run.branch}
                      {run.note ? ` · ${run.note}` : ""}
                    </span>
                  </div>
                  <div className="vw-run-side">
                    <span className={run.status === "Passed" ? "vw-tone-ok" : "vw-tone-critical"}>{run.status}</span>
                    <span className="vw-muted vw-num">
                      {Math.floor(run.seconds / 60)}m {run.seconds % 60}s · {timeAgo(now - run.minutesAgo * 60_000, now)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="vw-section" aria-labelledby="incident-title">
          <div className="vw-section-head vw-incident-head">
            <h2 id="incident-title">Incidents</h2>
            <div className="vw-filters">
              <div className="vw-segmented" role="group" aria-label="Filter by severity">
                {["All", ...SEVERITIES].map((s) => (
                  <button key={s} type="button" aria-pressed={severity === s} onClick={() => setSeverity(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <label className="vw-search">
                <span className="vw-visually-hidden">Search incidents</span>
                <input type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <label className="vw-check">
                <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
                Show resolved
              </label>
              <button type="button" className="vw-btn" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>
                Export CSV
              </button>
            </div>
          </div>

          <div className="vw-table-wrap">
            <table className="vw-table vw-incidents">
              <caption className="vw-visually-hidden">Infrastructure incidents, newest first</caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Incident</th>
                  <th scope="col">Opened</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="vw-visually-hidden">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((i) => (
                    <tr key={i.id} className={i.status === "Resolved" ? "vw-row-resolved" : undefined}>
                      <td>
                        <span className={`vw-sev vw-sev-${i.severity.toLowerCase()}`}>{i.severity}</span>
                      </td>
                      <td>
                        <span className="vw-incident-service">{i.service}</span>
                        <span className="vw-incident-message">{i.message}</span>
                        <span className="vw-muted vw-mono">{i.id}</span>
                      </td>
                      <td className="vw-muted vw-num vw-nowrap">{timeAgo(i.at, now)}</td>
                      <td className="vw-nowrap">{i.status}</td>
                      <td className="vw-action">
                        {ACTION_LABEL[i.status] && (
                          <button type="button" className="vw-link" onClick={() => advance(i.id)} aria-label={`${ACTION_LABEL[i.status]} ${i.id}`}>
                            {ACTION_LABEL[i.status]}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="vw-empty" colSpan="5">
                      No incidents match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="vw-footer vw-muted">
          <span>VigilantWeb · demo telemetry simulated in the browser</span>
          <span>Thresholds read from .vigilantrc.json and package.json</span>
        </footer>
      </div>
    </main>
  );
}
