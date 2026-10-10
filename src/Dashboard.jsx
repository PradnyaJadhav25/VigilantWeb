import { useEffect, useState } from "react";
import "./styles/dashboard.css";

const incidents = [
  {
    severity: "Warning",
    service: "API Gateway",
    message: "Elevated latency detected in the west region.",
    status: "Investigating",
  },
  {
    severity: "Info",
    service: "Worker Cluster",
    message: "Node 12 completed its scheduled maintenance.",
    status: "Resolved",
  },
  {
    severity: "Critical",
    service: "Database Replica",
    message: "Replication lag exceeded the 30-second threshold.",
    status: "Monitoring",
  },
];

function formatTimestamp(date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export function VigilantDashboard() {
  const [timestamp, setTimestamp] = useState(() => new Date());
  const [telemetry, setTelemetry] = useState({ cpu: 24, memory: 3.2 });
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTimestamp(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function refreshTelemetry() {
    setTelemetry({
      cpu: Math.floor(18 + Math.random() * 15),
      memory: Number((3 + Math.random() * 0.6).toFixed(1)),
    });
    setTimestamp(new Date());
    setRefreshCount((count) => count + 1);
  }

  return (
    <main className="vw-dashboard">
      <div className="vw-dashboard-shell">
        <header className="vw-dashboard-header">
          <div>
            <p className="vw-dashboard-kicker">INFRASTRUCTURE OVERVIEW</p>
            <h1>VigilantWeb System Status</h1>
            <p className="vw-dashboard-subtitle">
              Live health and telemetry across your services.
            </p>
          </div>
          <div className="vw-dashboard-header-meta">
            <span className="vw-dashboard-live">
              <span className="vw-dashboard-status-dot" />
              All systems active
            </span>
            <time dateTime={timestamp.toISOString()}>
              Updated {formatTimestamp(timestamp)}
            </time>
          </div>
        </header>

        <section className="vw-dashboard-metrics" aria-label="System metrics">
          <article className="vw-dashboard-card">
            <div className="vw-dashboard-card-heading">
              <div>
                <p className="vw-dashboard-label">API GATEWAY HEALTH</p>
                <h2>API Gateway</h2>
              </div>
              <span className="vw-dashboard-state">Operational</span>
            </div>
            <p className="vw-dashboard-metric-value">42<span>ms</span></p>
            <p className="vw-dashboard-muted">Average response time</p>
            <div className="vw-dashboard-card-foot">
              <span className="vw-dashboard-status-dot" />
              All endpoints responding
            </div>
          </article>

          <article className="vw-dashboard-card">
            <div className="vw-dashboard-card-heading">
              <div>
                <p className="vw-dashboard-label">RESOURCE UTILIZATION</p>
                <h2>CPU &amp; Memory Usage</h2>
              </div>
              <span className="vw-dashboard-card-icon" aria-hidden="true">CPU</span>
            </div>
            <div className="vw-dashboard-usage">
              <div className="vw-dashboard-usage-heading">
                <span>CPU</span><strong>{telemetry.cpu}%</strong>
              </div>
              <progress aria-label="CPU usage" max="100" value={telemetry.cpu}>
                {telemetry.cpu}%
              </progress>
            </div>
            <div className="vw-dashboard-usage">
              <div className="vw-dashboard-usage-heading">
                <span>Memory</span><strong>{telemetry.memory} GB / 8 GB</strong>
              </div>
              <progress
                aria-label="Memory usage"
                max="8"
                value={telemetry.memory}
              >
                {Math.round((telemetry.memory / 8) * 100)}%
              </progress>
            </div>
          </article>

          <article className="vw-dashboard-card">
            <div className="vw-dashboard-card-heading">
              <div>
                <p className="vw-dashboard-label">COMPUTE FLEET</p>
                <h2>Active Worker Nodes</h2>
              </div>
              <span className="vw-dashboard-card-icon" aria-hidden="true">NODES</span>
            </div>
            <p className="vw-dashboard-node-count">12</p>
            <span className="vw-dashboard-node-badge">
              <span className="vw-dashboard-status-dot" />
              Nodes Online
            </span>
            <p className="vw-dashboard-muted">Across 3 availability zones</p>
          </article>
        </section>

        <section className="vw-dashboard-incidents" aria-labelledby="incident-title">
          <div className="vw-dashboard-section-heading">
            <div>
              <p className="vw-dashboard-label">MONITORING</p>
              <h2 id="incident-title">Incident Log</h2>
            </div>
            <div className="vw-dashboard-actions">
              <button
                className="vw-dashboard-button vw-dashboard-button-secondary"
                onClick={() => setAlertsVisible((visible) => !visible)}
                aria-pressed={alertsVisible}
                type="button"
              >
                {alertsVisible ? "Filter Alerts: On" : "Filter Alerts: Off"}
              </button>
              <button
                className="vw-dashboard-button vw-dashboard-button-primary"
                onClick={refreshTelemetry}
                type="button"
              >
                Refresh Telemetry
              </button>
            </div>
          </div>
          <p className="vw-dashboard-refresh-note" aria-live="polite">
            {refreshCount > 0 ? `Telemetry refreshed ${refreshCount} time${refreshCount === 1 ? "" : "s"}.` : "Latest telemetry is shown."}
          </p>
          <div className="vw-dashboard-table-wrap">
            <table>
              <caption className="vw-dashboard-visually-hidden">
                Recent infrastructure alerts
              </caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Message</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {alertsVisible ? incidents.map((incident) => (
                  <tr key={incident.service}>
                    <td>
                      <span className={`vw-dashboard-severity vw-dashboard-severity-${incident.severity.toLowerCase()}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="vw-dashboard-service">{incident.service}</td>
                    <td>{incident.message}</td>
                    <td>{incident.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="vw-dashboard-empty" colSpan="4">
                      Alerts are hidden. Turn on the filter to view the incident log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="vw-dashboard-footer">
          <span>VigilantWeb Infrastructure Monitor</span>
          <span>Telemetry refreshes on demand</span>
        </footer>
      </div>
    </main>
  );
}
