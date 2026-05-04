import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

const palette = [
  "#fabd2f", "#06d6a0", "#74b9ff", "#fd79a8",
  "#a29bfe", "#fdcb6e", "#55efc4", "#fd9644",
  "#e17055", "#00b894",
];

const VLSMResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location?.state?.results;
  const [subnetResults, setSubnetResults] = useState([]);
  const [toast, setToast] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (results) setSubnetResults(results);
  }, [results]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));
  }, []);

  const copyAll = useCallback(() => {
    const text = subnetResults
      .map(
        (r, i) =>
          `Subnet ${i + 1} (${r.requiredHosts} hosts): ${r.networkAddress}/${r.subnetMaskCIDR} | Mask: ${r.subnetMaskDecimal} | Wildcard: ${r.wildcardMask} | Broadcast: ${r.broadcastAddress} | Range: ${r.usableRange}`
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => setToast("All results copied!"));
  }, [subnetResults]);

  const exportCSV = useCallback(() => {
    const header = "Required Hosts,Network Address,CIDR,Subnet Mask,Wildcard Mask,Broadcast,Usable Range\n";
    const rows = subnetResults
      .map(
        (r) =>
          `${r.requiredHosts},${r.networkAddress},/${r.subnetMaskCIDR},${r.subnetMaskDecimal},${r.wildcardMask},${r.broadcastAddress},${r.usableRange}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vlsm_results.csv";
    a.click();
    setToast("CSV exported!");
  }, [subnetResults]);

  const totalHosts = subnetResults.reduce((a, r) => a + r.requiredHosts, 0);

  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(400px, 70vw)",
          height: "min(400px, 70vw)",
          background: "radial-gradient(circle, rgba(6,214,160,0.07) 0%, transparent 70%)",
          top: 0,
          left: "30%",
        }}
      />
      <NavBar />

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="page-content">
        <div className="page-content-inner">
          {/* Header */}
          <div
            className="animate-fadeInUp results-header"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div className="section-tag">Results</div>
              <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 800 }}>VLSM Results</h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                {subnetResults.length} subnet{subnetResults.length !== 1 ? "s" : ""} allocated
              </p>
            </div>
            <div
              className="results-actions"
              style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
            >
              <div
                className="view-toggle"
                style={{
                  display: "flex",
                  gap: 4,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: 4,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {["table", "visual"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Syne, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      background: viewMode === m ? "var(--cyan)" : "transparent",
                      color: viewMode === m ? "#0a0c10" : "var(--text-muted)",
                      transition: "all 0.2s",
                      minHeight: 36,
                      flex: 1,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button className="btn-secondary" onClick={copyAll} style={{ fontSize: 12 }}>
                Copy All
              </button>
              <button className="btn-secondary" onClick={exportCSV} style={{ fontSize: 12 }}>
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          {subnetResults.length > 0 && (
            <div
              className="animate-fadeInUp stagger-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Total Subnets", value: subnetResults.length },
                { label: "Total Hosts Needed", value: totalHosts.toLocaleString() },
                { label: "Largest Subnet", value: `/${subnetResults[0]?.subnetMaskCIDR}` },
                { label: "Smallest Subnet", value: `/${subnetResults[subnetResults.length - 1]?.subnetMaskCIDR}` },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {subnetResults.length > 0 ? (
            <div className="animate-fadeInUp stagger-2">
              {viewMode === "table" ? (
                <>
                  {/* Desktop Table */}
                  <div className="card desktop-only" style={{ overflow: "hidden" }}>
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                      <table className="result-table">
                        <thead>
                          <tr>
                            <th>Req. Hosts</th>
                            <th>Network Address</th>
                            <th>Subnet Mask</th>
                            <th>Wildcard Mask</th>
                            <th>Broadcast</th>
                            <th>Usable Range</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {subnetResults.map((result, index) => (
                            <tr key={result.networkAddress + index}>
                              <td><span className="badge badge-cyan">{result.requiredHosts}</span></td>
                              <td>
                                <span className="ip-display">
                                  {result.networkAddress}/{result.subnetMaskCIDR}
                                </span>
                              </td>
                              <td><span style={{ color: "var(--text-secondary)" }}>{result.subnetMaskDecimal}</span></td>
                              <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{result.wildcardMask}</span></td>
                              <td><span style={{ color: "var(--text-secondary)" }}>{result.broadcastAddress}</span></td>
                              <td>
                                <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                                  {result.usableRange}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="copy-btn"
                                  onClick={() => copyToClipboard(`${result.networkAddress}/${result.subnetMaskCIDR}`)}
                                >
                                  ⎘
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="mobile-only">
                    {subnetResults.map((result, index) => (
                      <div key={index} className="mobile-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                          <span className="badge badge-cyan">{result.requiredHosts} hosts</span>
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(`${result.networkAddress}/${result.subnetMaskCIDR}`)}
                          >
                            ⎘ Copy
                          </button>
                        </div>
                        {[
                          ["Network", `${result.networkAddress}/${result.subnetMaskCIDR}`],
                          ["Mask", result.subnetMaskDecimal],
                          ["Wildcard", result.wildcardMask],
                          ["Broadcast", result.broadcastAddress],
                          ["Range", result.usableRange],
                        ].map(([k, v]) => (
                          <div key={k} className="mobile-card-row">
                            <span className="mobile-card-key">{k}</span>
                            <span className="mobile-card-val">{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Visual proportional block view */
                <div className="card" style={{ padding: "clamp(16px, 4vw, 28px)" }}>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Address Space — Proportional Allocation
                    </span>
                  </div>

                  {/* Proportional bar */}
                  <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 24, gap: 2 }}>
                    {subnetResults.map((r, i) => {
                      const size = Math.pow(2, 32 - parseInt(r.subnetMaskCIDR));
                      return (
                        <div
                          key={i}
                          title={`${r.networkAddress}/${r.subnetMaskCIDR} — ${r.requiredHosts} hosts`}
                          style={{
                            flex: size,
                            background: palette[i % palette.length],
                            opacity: 0.8,
                            minWidth: 4,
                            transition: "opacity 0.2s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {subnetResults.map((r, i) => {
                      const subnetSize = Math.pow(2, 32 - parseInt(r.subnetMaskCIDR));
                      const usable = subnetSize - 2;
                      const efficiency = Math.round((r.requiredHosts / usable) * 100);
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, gap: 8, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: palette[i % palette.length], flexShrink: 0 }} />
                              <span className="ip-display" style={{ fontSize: "clamp(11px, 2vw, 13px)", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {r.networkAddress}/{r.subnetMaskCIDR}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                              <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--text-muted)" }}>
                                {r.requiredHosts} / {usable}
                              </span>
                              <span
                                className="badge"
                                style={{
                                  background: efficiency > 70 ? "rgba(6,214,160,0.1)" : "rgba(250,189,47,0.1)",
                                  color: efficiency > 70 ? "var(--cyan)" : "var(--gold)",
                                  border: `1px solid ${efficiency > 70 ? "rgba(6,214,160,0.2)" : "rgba(250,189,47,0.2)"}`,
                                  fontSize: 10,
                                }}
                              >
                                {efficiency}% eff.
                              </span>
                            </div>
                          </div>
                          <div className="subnet-bar">
                            <div
                              className="subnet-bar-fill"
                              style={{
                                width: `${efficiency}%`,
                                background: `linear-gradient(90deg, ${palette[i % palette.length]}cc, ${palette[i % palette.length]}44)`,
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 3, gap: 8 }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>mask: {r.subnetMaskDecimal}</span>
                            <span style={{ flexShrink: 0 }}>wildcard: {r.wildcardMask}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              No results available.
            </div>
          )}

          {/* Actions */}
          <div className="page-actions" style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              style={{ background: "var(--cyan)", color: "#0a0f1a" }}
              onClick={() => navigate("/vlsm-subnet")}
            >
              ← Calculate Again
            </button>
            <Link to="/" className="btn-secondary" style={{ textDecoration: "none" }}>Home</Link>
            <Link to="/normal-subnet" className="btn-secondary" style={{ textDecoration: "none" }}>Try FLSM →</Link>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by{" "}
        <a href="https://github.com/hafiz-sakib" target="_blank" rel="noopener noreferrer">
          Mohammad Hafizur Rahman Sakib
        </a>
      </footer>
    </div>
  );
};

export default VLSMResults;
