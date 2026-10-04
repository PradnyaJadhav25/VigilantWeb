# Qualis – Lighthouse CI

Qualis is a sample web application integrated with Lighthouse CI and GitHub Actions to automatically audit the application's quality on every code change.

The project demonstrates a CI pipeline that builds the web application, runs Lighthouse audits, measures Performance, Accessibility, Best Practices, and SEO, and uses configured thresholds as quality gates.

## Project Objective

The objective of this project is to:

* Deploy a sample web application.
* Integrate Lighthouse CI into a GitHub Actions workflow.
* Automatically audit the application on code changes.
* Measure Performance, Accessibility, Best Practices, and SEO.
* Configure minimum score thresholds.
* Pass or fail the CI pipeline based on Lighthouse audit results.

## Technology Stack

* React
* Vite
* JavaScript
* CSS
* GitHub
* GitHub Actions
* Lighthouse CI
* GitHub Pages
* Node.js

## Project Structure

```text
Qualis/
├── .github/
│   └── workflows/
│       └── lighthouse.yml
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── lighthouserc.json
├── package.json
├── package-lock.json
└── vite.config.js
```

## Application Deployment

The application is built using Vite and configured for deployment under the `/Qualis/` path.

The Vite configuration uses:

```javascript
base: "/Qualis/"
```

The production application can be deployed using GitHub Pages.

## Lighthouse CI Configuration

Lighthouse CI is configured using `lighthouserc.json`.

The application is first built and then served using the Vite preview server:

```text
npm run build
        ↓
Vite preview server
        ↓
Lighthouse CI
```

Lighthouse CI performs three audit runs:

```json
"numberOfRuns": 3
```

The configured Lighthouse quality thresholds are:

| Category       | Minimum Score |
| -------------- | ------------: |
| Performance    |           80% |
| Accessibility  |           90% |
| Best Practices |           90% |
| SEO            |           90% |

The assertions use the `error` severity, which means that falling below a configured threshold causes the Lighthouse CI step to fail.

## GitHub Actions Workflow

The GitHub Actions workflow is located at:

```text
.github/workflows/lighthouse.yml
```

The workflow is triggered when changes are pushed to the `main` branch or when a pull request targets the `main` branch.

The CI pipeline performs the following steps:

```text
Code Change
     ↓
Git Push / Pull Request
     ↓
GitHub Actions
     ↓
Checkout Repository
     ↓
Setup Node.js
     ↓
Install Dependencies
     ↓
Build Application
     ↓
Run Lighthouse CI
     ↓
Run Lighthouse Audits
     ↓
Check Quality Thresholds
     ↓
Pass / Fail
```

## GitHub Actions Workflow

The workflow performs:

1. Checkout of the repository.
2. Node.js setup.
3. Installation of project dependencies.
4. Production build of the application.
5. Execution of Lighthouse CI.

The main Lighthouse command used by the workflow is:

```bash
npx @lhci/cli@0.15.x autorun
```

## Quality Gate

The Lighthouse assertions act as a quality gate for the CI pipeline.

For example, the configured rules require:

```text
Performance    >= 0.80
Accessibility  >= 0.90
Best Practices >= 0.90
SEO            >= 0.90
```

If all required scores meet their thresholds:

```text
Lighthouse Assertions
        ↓
All requirements satisfied
        ↓
GitHub Actions
        ↓
SUCCESS
```

If any required score falls below its threshold:

```text
Lighthouse Assertions
        ↓
Threshold not satisfied
        ↓
GitHub Actions
        ↓
FAILURE
```

This ensures that changes that reduce the application's required quality levels can be detected automatically.

## Running the Project Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd Qualis
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available through the Vite development server.

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Running Lighthouse CI Locally

After building the application, Lighthouse CI can be executed using:

```bash
npx @lhci/cli@0.15.x autorun
```

Lighthouse CI starts the configured preview server, performs the configured number of Lighthouse runs, checks the assertions, and reports whether the configured quality requirements were satisfied.

## Lighthouse Report

The Lighthouse configuration uses:

```json
"upload": {
  "target": "temporary-public-storage"
}
```

After a successful Lighthouse CI run, the command provides a report URL containing the Lighthouse results.

The report contains information about:

* Performance
* Accessibility
* Best Practices
* SEO
* Individual Lighthouse audits

The uploaded report uses temporary public storage and is not intended to be a permanent project archive.

## CI Result

A successful GitHub Actions execution indicates that:

* The application builds successfully.
* Lighthouse CI executes successfully.
* The configured Lighthouse audits complete.
* The required Lighthouse thresholds are satisfied.
* The CI quality gate passes.

A failed execution can indicate that the build failed or that one or more Lighthouse assertions did not satisfy their configured thresholds.

## DevOps Concepts Demonstrated

This project demonstrates the following DevOps concepts:

### Continuous Integration

Every push or pull request can automatically trigger the workflow, allowing the application to be validated without manually running the tests.

### Automation

The build and Lighthouse auditing processes are automated using GitHub Actions.

### Quality Gates

Lighthouse thresholds prevent the CI pipeline from passing when required quality scores fall below the configured limits.

### Continuous Quality Monitoring

The application is automatically evaluated for Performance, Accessibility, Best Practices, and SEO after code changes.

### Feedback

The GitHub Actions result provides immediate feedback about whether the latest code satisfies the configured quality requirements.

## Expected Outcome

The completed pipeline provides an automated process:

```text
Developer makes a change
          ↓
Changes pushed to GitHub
          ↓
GitHub Actions starts
          ↓
Dependencies installed
          ↓
Application built
          ↓
Lighthouse CI runs
          ↓
Performance / Accessibility /
Best Practices / SEO measured
          ↓
Thresholds checked
          ↓
      ┌───────────────┐
      │               │
   PASS            FAIL
      │               │
 CI succeeds      CI fails
```

## Conclusion

Qualis demonstrates the integration of Lighthouse CI with GitHub Actions for automated web application quality testing. The pipeline automatically builds and audits the application whenever relevant code changes are submitted. Lighthouse evaluates Performance, Accessibility, Best Practices, and SEO using configured minimum score thresholds. These thresholds act as quality gates that determine whether the CI pipeline passes or fails. This provides an automated approach to maintaining application quality throughout the development workflow.
