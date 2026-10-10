# VigilantWeb – Automated Quality & Performance Gate

VigilantWeb is a React dashboard paired with an automated web quality pipeline. On every push and pull request targeting `main` or `dev`, GitHub Actions lints and builds the **System Metrics Dashboard**, enforces bundle-size budgets, and runs Lighthouse CI against its production preview. Performance, accessibility, best-practice, and Core Web Vitals assertions prevent regressions from passing the quality gate.

## Project structure

```text
VigilantWeb/
├── .github/
│   └── workflows/
│       └── audit-pipeline.yml
├── .gitignore
├── public/
│   ├── favicon.svg
├── src/
│   ├── components/
│   │   └── Charts.jsx
│   ├── styles/
│   │   └── dashboard.css
│   ├── Dashboard.jsx
│   ├── data.js
│   ├── index.css
│   └── index.jsx
├── .vigilantrc.json
├── a11y-thresholds.json
├── color-audit-log.json
├── eslint.config.js
├── index.html
├── README.md
├── package-lock.json
├── package.json
└── vite.config.js
```

## Dashboard features

- **Status at a glance:** overall health derived from open incidents, with a live/pause toggle and manual refresh.
- **Key metrics:** CPU, memory, p95 latency, requests per second and error rate, each with a sparkline and change over the selected range. Selecting a metric opens it in the main chart.
- **Trend chart:** 15-minute, 1-hour or 6-hour range, hover readout, and incident markers along the time axis.
- **Services:** per-service status, current latency and a 30-day uptime bar.
- **Quality gate:** latest Lighthouse and bundle-size results compared with the thresholds read directly from `.vigilantrc.json` and the `size-limit` entries in `package.json`.
- **Pipeline runs:** recent `audit-pipeline.yml` runs with commit, branch, duration and outcome.
- **Incidents:** filter by severity, search, show or hide resolved items, acknowledge and resolve, and export the current view as CSV.

Telemetry, incidents and pipeline runs are simulated in the browser for demonstration; no backend is required. The dashboard uses no charting library, so it stays well inside the bundle budget.

## Quality gates

- **Performance:** Lighthouse Performance score must be at least 0.80; Largest Contentful Paint must be no more than 2,500 ms.
- **Accessibility:** Lighthouse Accessibility score must be at least 0.90. The dashboard uses semantic sections and tables, named controls, visible focus states, and accessible progress indicators.
- **Best Practices:** Lighthouse Best Practices score must be at least 0.90.
- **Layout stability:** Cumulative Layout Shift must be no more than 0.1.
- **Code quality:** ESLint checks JavaScript/JSX and HTMLHint checks the page markup before the production build.
- **Bundle size:** `npm run check:size` enforces a 250 KB JavaScript and 50 KB CSS budget for generated assets.

Lighthouse assertions and production-preview settings live in `.vigilantrc.json`. No public report upload is configured.

## Local development

### Prerequisites

- Node.js 20.x
- npm

### Install and run

```bash
npm ci
npm run dev
```

Vite starts the development server and prints its local URL.

### Lint, build, and preview

```bash
npm run lint
npm run build
npm run check:size
npm run preview
```

### Run the complete web audit

Build the app before starting Lighthouse CI:

```bash
npm run build
npm run audit:check
```

The audit runs three Lighthouse measurements against the built dashboard served at `/VigilantWeb/`, then evaluates the configured quality and Core Web Vitals assertions.

## Continuous integration

The `.github/workflows/audit-pipeline.yml` workflow runs on pushes and pull requests to `main` and `dev`. It uses Node.js 20.x and runs dependency installation, ESLint, the Vite production build, bundle-size checks, and Lighthouse CI in sequence. A failed lint rule, exceeded size budget, failed build, or unmet Lighthouse threshold fails the workflow.

## Dashboard

The System Metrics Dashboard shows API Gateway health and response time, CPU and memory utilization, online worker nodes, and a recent incident log. The telemetry refresh button simulates updated CPU and memory measurements; the alert filter toggles the incident list. The displayed timestamp updates continuously.
