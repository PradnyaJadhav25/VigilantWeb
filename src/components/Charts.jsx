import { useState } from "react";
import { downsample, formatMetric } from "../data.js";

const timeFormat = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false });

function scale(values, floorAtZero = true) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 1e-6) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.15;
  min = floorAtZero ? Math.max(0, min - pad) : min - pad;
  max += pad;
  return { min, max };
}

function nearestIndex(points, time) {
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (points[mid].time < time) low = mid + 1;
    else high = mid;
  }
  if (low > 0 && time - points[low - 1].time < points[low].time - time) return low - 1;
  return low;
}

export function Sparkline({ values }) {
  const width = 96;
  const height = 24;
  const { min, max } = scale(values, false);
  const path = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * width;
      const y = height - ((v - min) / (max - min)) * height;
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
  return (
    <svg className="vw-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function LineChart({ points, metric, markers }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const data = downsample(points, 480);
  const width = 1000;
  const height = 220;
  const values = data.map((p) => p[metric.id]);
  const { min, max } = scale(values);
  const t0 = data[0].time;
  const span = Math.max(1, data[data.length - 1].time - t0);
  const xPct = (time) => ((time - t0) / span) * 100;
  const yPct = (value) => (1 - (value - min) / (max - min)) * 100;

  const line = data
    .map((p, i) => `${i ? "L" : "M"}${((xPct(p.time) / 100) * width).toFixed(1)},${((yPct(p[metric.id]) / 100) * height).toFixed(1)}`)
    .join("");
  const area = `${line}L${width},${height}L0,${height}Z`;

  const active = data[hoverIndex ?? data.length - 1];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const ticks = [0.25, 0.5, 0.75].map((f) => min + (max - min) * (1 - f));

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHoverIndex(nearestIndex(data, t0 + ratio * span));
  }

  return (
    <figure className="vw-chart">
      <figcaption className="vw-chart-readout" aria-live="off">
        <span className="vw-chart-value">
          {formatMetric(metric, active[metric.id])}
          <small>{metric.unit.trim()}</small>
        </span>
        <span className="vw-muted">
          {hoverIndex === null ? "Latest" : timeFormat.format(active.time)} · low {formatMetric(metric, low)} · high {formatMetric(metric, high)}
        </span>
      </figcaption>
      <div
        className="vw-chart-plot"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${metric.label} over the selected range: low ${formatMetric(metric, low)}${metric.unit}, high ${formatMetric(metric, high)}${metric.unit}, latest ${formatMetric(metric, values[values.length - 1])}${metric.unit}.`}
        >
          {ticks.map((tick, i) => (
            <line key={i} className="vw-chart-grid" x1="0" x2={width} y1={(yPct(tick) / 100) * height} y2={(yPct(tick) / 100) * height} />
          ))}
          <path className="vw-chart-area" d={area} />
          <path className="vw-chart-line" d={line} />
        </svg>
        {ticks.map((tick, i) => (
          <span key={i} className="vw-chart-tick" style={{ top: `${yPct(tick)}%` }} aria-hidden="true">
            {formatMetric(metric, tick)}
          </span>
        ))}
        <span className="vw-chart-cursor" style={{ left: `${xPct(active.time)}%` }} aria-hidden="true" />
        <span
          className="vw-chart-dot"
          style={{ left: `${xPct(active.time)}%`, top: `${yPct(active[metric.id])}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="vw-chart-axis" aria-hidden="true">
        <span>{timeFormat.format(t0)}</span>
        <div className="vw-chart-markers">
          {markers
            .filter((m) => m.at >= t0)
            .map((m) => (
              <span
                key={m.id}
                className={`vw-marker vw-sev-${m.severity.toLowerCase()}`}
                style={{ left: `${xPct(m.at)}%` }}
                title={`${m.id} · ${m.service}`}
              />
            ))}
        </div>
        <span>Now</span>
      </div>
    </figure>
  );
}

const DAY_LABEL = { up: "Operational", degraded: "Degraded", down: "Outage" };

export function UptimeBar({ days, label }) {
  return (
    <svg className="vw-uptime" viewBox={`0 0 ${days.length * 4} 16`} preserveAspectRatio="none" role="img" aria-label={label}>
      {days.map((day, i) => (
        <rect key={i} className={`vw-uptime-${day}`} x={i * 4} y="0" width="3" height="16" rx="0.6">
          <title>{`${days.length - i} days ago: ${DAY_LABEL[day]}`}</title>
        </rect>
      ))}
    </svg>
  );
}
