import { Link, useLocation } from "react-router-dom";
import "./App.css";

function NavBar() {
  const location = useLocation();
  return (
    <nav className="nav-bar">
      <Link to="/" className="nav-logo">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect
            x="1"
            y="1"
            width="9"
            height="9"
            rx="2"
            fill="#fabd2f"
            opacity="0.9"
          />
          <rect
            x="12"
            y="1"
            width="9"
            height="9"
            rx="2"
            fill="#fabd2f"
            opacity="0.4"
          />
          <rect
            x="1"
            y="12"
            width="9"
            height="9"
            rx="2"
            fill="#fabd2f"
            opacity="0.4"
          />
          <rect
            x="12"
            y="12"
            width="9"
            height="9"
            rx="2"
            fill="#06d6a0"
            opacity="0.8"
          />
        </svg>
        Sub<span>Calc</span>
      </Link>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/normal-subnet"
          className={`nav-link ${location.pathname === "/normal-subnet" ? "active" : ""}`}
        >
          FLSM
        </Link>
        <Link
          to="/vlsm-subnet"
          className={`nav-link ${location.pathname.includes("vlsm") ? "active" : ""}`}
        >
          VLSM
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          background:
            "radial-gradient(circle, rgba(250,189,47,0.12) 0%, transparent 70%)",
          top: -200,
          right: -100,
          animation: "pulse-glow 6s ease-in-out infinite",
        }}
      />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          background:
            "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)",
          bottom: -100,
          left: -50,
          animation: "pulse-glow 8s ease-in-out infinite 2s",
        }}
      />

      <NavBar />

      <div className="page-content">
        <div className="page-content-inner page-content-inner--medium">
          {/* Hero */}
          <div
            className="animate-fadeInUp"
            style={{
              textAlign: "center",
              marginBottom: "clamp(36px, 7vw, 72px)",
            }}
          >
            <div className="section-tag" style={{ justifyContent: "center" }}>
              Network Utility Tool
            </div>
            <h1
              style={{
                fontSize: "clamp(32px, 9vw, 72px)",
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: 16,
                fontFamily: "Syne, sans-serif",
              }}
            >
              Subnet
              <br />
              <span style={{ color: "var(--gold)" }}>Calculator</span>
            </h1>
            <p
              style={{
                fontSize: "clamp(13px, 1.8vw, 15px)",
                color: "var(--text-secondary)",
                maxWidth: 440,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Precision IP subnetting for network engineers. Calculate FLSM and
              VLSM allocations with full detail output.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "clamp(12px, 3vw, 16px)",
              marginBottom: 20,
            }}
          >
            {/* FLSM Card */}
            <div
              className="card animate-fadeInUp stagger-1"
              style={{
                padding: "clamp(20px, 4vw, 32px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 120,
                  height: 120,
                  background:
                    "radial-gradient(circle at top right, rgba(250,189,47,0.1), transparent 70%)",
                  borderRadius: "0 14px 0 0",
                }}
              />
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "var(--gold-dim)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fabd2f"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <span className="badge badge-gold" style={{ marginBottom: 10 }}>
                  FLSM
                </span>
                <h2
                  style={{
                    fontSize: "clamp(18px, 3.5vw, 24px)",
                    fontWeight: 800,
                    marginBottom: 8,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  Fixed Length
                </h2>
                <p
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 13px)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  Divide a network into equal-sized subnets. Ideal for uniform
                  host requirements across segments.
                </p>
              </div>
              <div
                style={{
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  "Equal subnet sizes",
                  "Simple to implement",
                  "Predictable addressing",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--gold)",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>{" "}
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to="/normal-subnet"
                className="btn-primary"
                style={{ display: "flex", textDecoration: "none" }}
              >
                Open FLSM →
              </Link>
            </div>

            {/* VLSM Card */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{
                padding: "clamp(20px, 4vw, 32px)",
                position: "relative",
                overflow: "hidden",
                borderColor: "rgba(6,214,160,0.15)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 120,
                  height: 120,
                  background:
                    "radial-gradient(circle at top right, rgba(6,214,160,0.08), transparent 70%)",
                  borderRadius: "0 14px 0 0",
                }}
              />
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "var(--cyan-dim)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#06d6a0"
                    strokeWidth="1.8"
                  >
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                  </svg>
                </div>
                <span className="badge badge-cyan" style={{ marginBottom: 10 }}>
                  VLSM
                </span>
                <h2
                  style={{
                    fontSize: "clamp(18px, 3.5vw, 24px)",
                    fontWeight: 800,
                    marginBottom: 8,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  Variable Length
                </h2>
                <p
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 13px)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  Efficiently allocate different-sized subnets based on host
                  requirements for each segment.
                </p>
              </div>
              <div
                style={{
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  "Optimized address space",
                  "Flexible allocation",
                  "Sorted by host need",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--cyan)",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>{" "}
                    {f}
                  </div>
                ))}
              </div>
              <Link
                to="/vlsm-subnet"
                className="btn-primary"
                style={{
                  display: "flex",
                  textDecoration: "none",
                  background: "var(--cyan-dim)",
                  color: "var(--cyan)",
                  border: "1px solid rgba(6,214,160,0.25)",
                  boxShadow: "none",
                }}
              >
                Open VLSM →
              </Link>
            </div>
          </div>

          {/* Info strip */}
          <div
            className="card animate-fadeInUp stagger-3"
            style={{ padding: "clamp(16px, 3vw, 20px) clamp(16px, 4vw, 28px)" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: "clamp(12px, 3vw, 16px) clamp(8px, 2vw, 12px)",
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              {[
                { label: "Supports", value: "IPv4" },
                { label: "Max Subnets", value: "/32" },
                { label: "CIDR Notation", value: "Yes" },
                { label: "Wildcard Mask", value: "VLSM" },
                { label: "Copy Results", value: "Yes" },
                { label: "History Log", value: "Yes" },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    className="stat-value"
                    style={{ fontSize: "clamp(13px, 2.5vw, 18px)" }}
                  >
                    {value}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by{" "}
        <a
          href="https://github.com/hafiz-sakib"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohammad Hafizur Rahman Sakib
        </a>
      </footer>
    </div>
  );
}

export default App;
