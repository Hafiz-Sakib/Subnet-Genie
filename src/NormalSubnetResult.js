import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

function getSubnetPrefixLength(subnetMask) {
  return (
    subnetMask
      .split(".")
      .map((o) => parseInt(o).toString(2).padStart(8, "0"))
      .join("")
      .split("1").length - 1
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

function NormalSubnetResult() {
  const [subnets, setSubnets] = useState([]);
  const [toast, setToast] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();

  useEffect(() => {
    const result = JSON.parse(sessionStorage.getItem("subnets"));
    if (result) setSubnets(result);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));
  }, []);

  const copyAll = useCallback(() => {
    const text = subnets
      .map(
        (s) =>
          `Subnet ${s.subnet}: ${s.networkAddress}/${getSubnetPrefixLength(s.subnetMask)} | Mask: ${s.subnetMask} | Broadcast: ${s.broadcastAddress} | Range: ${s.firstHost} - ${s.lastHost} | Hosts: ${s.usableHosts}`
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => setToast("All results copied!"));
  }, [subnets]);

  const exportCSV = useCallback(() => {
    const header = "Subnet,Network Address,CIDR,Subnet Mask,Broadcast,First Host,Last Host,Usable Hosts\n";
    const rows = subnets
      .map(
        (s) =>
          `${s.subnet},${s.networkAddress},/${getSubnetPrefixLength(s.subnetMask)},${s.subnetMask},${s.broadcastAddress},${s.firstHost},${s.lastHost},${s.usableHosts}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flsm_results.csv";
    a.click();
    setToast("CSV exported!");
  }, [subnets]);

  const totalHosts = subnets.reduce((a, s) => a + (s.usableHosts || 0), 0);

  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(400px, 70vw)",
          height: "min(400px, 70vw)",
          background: "radial-gradient(circle, rgba(250,189,47,0.08) 0%, transparent 70%)",
          top: 0,
          left: "50%",
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
              <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 800 }}>FLSM Results</h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                {subnets.length} subnet{subnets.length !== 1 ? "s" : ""} calculated
              </p>
            </div>
            <div
              className="results-actions"
              style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
            >
              {/* View toggle */}
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
                      background: viewMode === m ? "var(--gold)" : "transparent",
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

          {/* Stats row */}
          {subnets.length > 0 && (
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
                { label: "Total Subnets", value: subnets.length },
                { label: "Usable Hosts Each", value: subnets[0]?.usableHosts ?? "—" },
                { label: "Total Usable Hosts", value: totalHosts.toLocaleString() },
                { label: "Subnet Mask CIDR", value: `/${getSubnetPrefixLength(subnets[0]?.subnetMask || "255.255.255.0")}` },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {subnets.length > 0 ? (
            <div className="animate-fadeInUp stagger-2">
              {viewMode === "table" ? (
                <>
                  {/* Desktop Table */}
                  <div className="card desktop-only" style={{ overflow: "hidden" }}>
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                      <table className="result-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Network Address</th>
                            <th>Subnet Mask</th>
                            <th>Broadcast</th>
                            <th>First Host</th>
                            <th>Last Host</th>
                            <th>Usable</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {subnets.map((subnet, index) => (
                            <tr key={index}>
                              <td><span className="badge badge-gold">{subnet.subnet}</span></td>
                              <td>
                                <span className="ip-display">
                                  {subnet.networkAddress}/{getSubnetPrefixLength(subnet.subnetMask)}
                                </span>
                              </td>
                              <td><span style={{ color: "var(--text-secondary)" }}>{subnet.subnetMask}</span></td>
                              <td><span style={{ color: "var(--text-secondary)" }}>{subnet.broadcastAddress}</span></td>
                              <td><span style={{ color: "var(--cyan)", fontFamily: "DM Mono, monospace", fontSize: 13 }}>{subnet.firstHost}</span></td>
                              <td><span style={{ color: "var(--cyan)", fontFamily: "DM Mono, monospace", fontSize: 13 }}>{subnet.lastHost}</span></td>
                              <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{subnet.usableHosts}</span></td>
                              <td>
                                <button
                                  className="copy-btn"
                                  onClick={() => copyToClipboard(`${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`)}
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
                    {subnets.map((subnet, index) => (
                      <div key={index} className="mobile-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
                          <span className="badge badge-gold">Subnet {subnet.subnet}</span>
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(`${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`)}
                          >
                            ⎘ Copy
                          </button>
                        </div>
                        {[
                          ["Network", `${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`],
                          ["Mask", subnet.subnetMask],
                          ["Broadcast", subnet.broadcastAddress],
                          ["First Host", subnet.firstHost],
                          ["Last Host", subnet.lastHost],
                          ["Usable Hosts", subnet.usableHosts],
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
                /* Visual mode */
                <div className="card" style={{ padding: "clamp(16px, 4vw, 28px)" }}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Address Space Visualization
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {subnets.map((subnet, index) => {
                      const colors = ["#fabd2f", "#06d6a0", "#74b9ff", "#fd79a8", "#a29bfe", "#fdcb6e", "#55efc4", "#fd9644"];
                      const color = colors[index % colors.length];
                      return (
                        <div key={index}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                              <span style={{ fontFamily: "DM Mono, monospace", fontSize: "clamp(11px, 2vw, 13px)", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                                {subnet.networkAddress}/{getSubnetPrefixLength(subnet.subnetMask)}
                              </span>
                            </div>
                            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                              {subnet.usableHosts} hosts
                            </span>
                          </div>
                          <div className="subnet-bar">
                            <div
                              className="subnet-bar-fill"
                              style={{ width: `${100 / subnets.length}%`, background: `linear-gradient(90deg, ${color}99, ${color}44)` }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(9px, 1.5vw, 11px)", color: "var(--text-muted)", marginTop: 3, gap: 8 }}>
                            <span style={{ wordBreak: "break-all" }}>{subnet.firstHost}</span>
                            <span style={{ wordBreak: "break-all", textAlign: "right" }}>{subnet.lastHost}</span>
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
            <button className="btn-primary" onClick={() => navigate("/normal-subnet")}>
              ← Calculate Again
            </button>
            <Link to="/" className="btn-secondary" style={{ textDecoration: "none" }}>Home</Link>
            <Link to="/vlsm-subnet" className="btn-secondary" style={{ textDecoration: "none" }}>Try VLSM →</Link>
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
}

export default NormalSubnetResult;
