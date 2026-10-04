import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="container nav-content">
          <a href="#" className="logo">
            Qualis
          </a>

          <nav>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#quality">Quality</a>
          </nav>

          <a href="#get-started" className="nav-button">
            Get Started
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="eyebrow">CONTINUOUS WEB QUALITY</span>

              <h1>
                Build better web experiences,
                <span> automatically.</span>
              </h1>

              <p>
                Qualis continuously evaluates your website for performance,
                accessibility, best practices, and SEO — so every code change
                meets your quality standards.
              </p>

              <div className="hero-actions">
                <a href="#get-started" className="primary-button">
                  Get Started
                </a>

                <a href="#how-it-works" className="secondary-button">
                  See How It Works
                </a>
              </div>
            </div>

            <div className="hero-card">
              <div className="card-header">
                <div>
                  <span className="card-label">LATEST AUDIT</span>
                  <h2>Quality Report</h2>
                </div>
                <span className="status">PASSING</span>
              </div>

              <div className="score">
                <strong>94</strong>
                <span>/100</span>
              </div>

              <div className="score-label">Overall Quality Score</div>

              <div className="metrics">
                <div className="metric">
                  <div>
                    <span>Performance</span>
                    <strong>96</strong>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "96%" }} />
                  </div>
                </div>

                <div className="metric">
                  <div>
                    <span>Accessibility</span>
                    <strong>98</strong>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "98%" }} />
                  </div>
                </div>

                <div className="metric">
                  <div>
                    <span>Best Practices</span>
                    <strong>92</strong>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="metric">
                  <div>
                    <span>SEO</span>
                    <strong>91</strong>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "91%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">WHY QUALIS</span>
              <h2>Quality checks built into your workflow.</h2>
              <p>
                Catch web quality issues before they reach production with
                automated audits triggered by every code change.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">01</div>
                <h3>Automated Audits</h3>
                <p>
                  Run comprehensive website audits automatically whenever your
                  code changes.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">02</div>
                <h3>Quality Gates</h3>
                <p>
                  Define minimum quality standards and prevent regressions from
                  passing your CI pipeline.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">03</div>
                <h3>Actionable Metrics</h3>
                <p>
                  Measure performance, accessibility, best practices, and SEO
                  through clear quality metrics.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="quality" className="quality">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">QUALITY DIMENSIONS</span>
              <h2>Four signals. One quality standard.</h2>
            </div>

            <div className="quality-grid">
              <div className="quality-item">
                <span className="quality-number">01</span>
                <h3>Performance</h3>
                <p>
                  Measure loading speed, responsiveness, and the overall
                  experience of your website.
                </p>
              </div>

              <div className="quality-item">
                <span className="quality-number">02</span>
                <h3>Accessibility</h3>
                <p>
                  Identify opportunities to make your website more usable and
                  accessible to everyone.
                </p>
              </div>

              <div className="quality-item">
                <span className="quality-number">03</span>
                <h3>Best Practices</h3>
                <p>
                  Validate modern web development practices and identify
                  potential implementation issues.
                </p>
              </div>

              <div className="quality-item">
                <span className="quality-number">04</span>
                <h3>SEO</h3>
                <p>
                  Check whether your pages follow fundamental practices that
                  help search engines understand your content.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="workflow">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">THE WORKFLOW</span>
              <h2>From code change to quality gate.</h2>
            </div>

            <div className="workflow-grid">
              <div className="workflow-step">
                <span>01</span>
                <h3>Push</h3>
                <p>A developer pushes a change to the project repository.</p>
              </div>

              <div className="workflow-line" />

              <div className="workflow-step">
                <span>02</span>
                <h3>Audit</h3>
                <p>
                  The CI pipeline builds the application and runs an automated
                  web audit.
                </p>
              </div>

              <div className="workflow-line" />

              <div className="workflow-step">
                <span>03</span>
                <h3>Validate</h3>
                <p>
                  Audit results are compared against predefined quality
                  thresholds.
                </p>
              </div>

              <div className="workflow-line" />

              <div className="workflow-step">
                <span>04</span>
                <h3>Gate</h3>
                <p>
                  The pipeline passes when standards are met and fails when they
                  are not.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="get-started" className="cta">
          <div className="container">
            <div className="cta-content">
              <span className="eyebrow">READY TO SHIP BETTER?</span>
              <h2>Make web quality part of every deployment.</h2>
              <p>
                Automate quality checks and catch regressions before they reach
                your users.
              </p>
              <a href="#features" className="primary-button">
                Explore Qualis
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <div>
            <a href="#" className="logo">
              Qualis
            </a>
            <p>Continuous Web Quality, Automated.</p>
          </div>

          <p>Built with React &amp; Lighthouse CI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
