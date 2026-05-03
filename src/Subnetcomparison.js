import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";
import "./App.css";

function ipToInt(ip) {
  const o = ip.split(".").map(Number);
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}
function intToIP(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}
function isValidCIDR(cidr) {
  const p = cidr.trim().split("/");
  if (p.length !== 2) return false;
  const pfx = parseInt(p[1]);
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(p[0]) &&
    p[0].split(".").every((o) => +o >= 0 && +o <= 255) &&
    pfx >= 0 &&
    pfx <= 32
  );
}
function analyzeCIDR(cidr) {
  const [ip, pfxStr] = cidr.trim().split("/");
  const pfx = parseInt(pfxStr);
  const mask = pfx === 0 ? 0 : (0xffffffff << (32 - pfx)) >>> 0;
  const network = (ipToInt(ip) & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalAddrs = Math.pow(2, 32 - pfx);
  const usable = pfx <= 30 ? totalAddrs - 2 : pfx === 31 ? 2 : 1;
  const subnetMask = [24, 16, 8, 0].map((s) => (mask >>> s) & 0xff).join(".");
  const wildcard = [24, 16, 8, 0]
    .map((s) => ((~mask >>> 0) >>> s) & 0xff)
    .join(".");
  const firstOctet = parseInt(ip.split(".")[0]);
  const cls =
    firstOctet < 128
      ? "A"
      : firstOctet < 192
        ? "B"
        : firstOctet < 224
          ? "C"
          : firstOctet < 240
            ? "D"
            : "E";
  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 &&
      parseInt(ip.split(".")[1]) >= 16 &&
      parseInt(ip.split(".")[1]) <= 31) ||
    (firstOctet === 192 && parseInt(ip.split(".")[1]) === 168);
  return {
    cidr,
    pfx,
    network: intToIP(network),
    broadcast: intToIP(broadcast),
    firstHost: intToIP(network + 1),
    lastHost: intToIP(broadcast - 1),
    totalAddrs,
    usable,
    subnetMask,
    wildcard,
    cls,
    isPrivate,
  };
}

const COLORS = [
  "#fabd2f",
  "#06d6a0",
  "#74b9ff",
  "#fd79a8",
  "#a29bfe",
  "#fd9644",
];
const PRESETS = [
  ["/24", "192.168.1.0/24", "192.168.2.0/24", "192.168.3.0/24"],
  ["/various", "10.0.0.0/8", "172.16.0.0/16", "192.168.0.0/24", "10.0.0.0/30"],
  [
    "Enterprise",
    "10.10.0.0/22",
    "10.10.4.0/23",
    "10.10.6.0/24",
    "10.10.7.0/26",
  ],
];

function MiniBar({ value, max, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min((value / max) * 100, 100)}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function SubnetComparison() {
  const [inputs, setInputs] = useState([
    "10.0.0.0/8",
    "172.16.0.0/16",
    "192.168.0.0/24",
    "10.0.0.0/30",
  ]);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [toast, setToast] = useState("");
  const [sortKey, setSortKey] = useState("pfx");
  const [sortDir, setSortDir] = useState(1);

  const update = (i, val) => {
    const u = [...inputs];
    u[i] = val;
    setInputs(u);
    setResults(null);
  };
  const addRow = () => {
    if (inputs.length < 8) setInputs([...inputs, ""]);
  };
  const removeRow = (i) => {
    if (inputs.length > 2) setInputs(inputs.filter((_, idx) => idx !== i));
    setResults(null);
  };

  const compare = () => {
    const errs = inputs
      .map((v, i) =>
        !v.trim()
          ? `Row ${i + 1}: empty`
          : !isValidCIDR(v)
            ? `Row ${i + 1}: invalid CIDR`
            : null,
      )
      .filter(Boolean);
    setErrors(errs);
    if (errs.length) return;
    setResults(inputs.map(analyzeCIDR));
  };

  const sortedResults = results
    ? [...results].sort((a, b) => {
        let va = a[sortKey],
          vb = b[sortKey];
        if (typeof va === "string") return sortDir * va.localeCompare(vb);
        return sortDir * (va - vb);
      })
    : null;

  const maxAddrs = results ? Math.max(...results.map((r) => r.totalAddrs)) : 1;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const copy = (t) =>
    navigator.clipboard.writeText(t).then(() => setToast("Copied!"));

  const exportCSV = () => {
    if (!results) return;
    const header =
      "CIDR,Prefix,Network,Broadcast,First Host,Last Host,Total Addresses,Usable Hosts,Subnet Mask,Wildcard,Class,Private";
    const rows = results.map(
      (r) =>
        `${r.cidr},/${r.pfx},${r.network},${r.broadcast},${r.firstHost},${r.lastHost},${r.totalAddrs},${r.usable},${r.subnetMask},${r.wildcard},${r.cls},${r.isPrivate}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subnet_comparison.csv";
    a.click();
    setToast("Exported!");
  };

  const SortIcon = ({ k }) =>
    sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : " ·";

  return (
    <div
      className="page-wrapper"
      style={{ background: "var(--bg-deep)", minHeight: "100vh" }}
    >
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(162,155,254,0.08) 0%, transparent 70%)",
          top: -100,
          left: -100,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Analysis</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Subnet Comparison Table
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Compare multiple CIDR blocks side by side with sortable columns, bar
            charts, and CSV export.
          </p>
        </div>

        {/* Input */}
        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 28, marginBottom: 20 }}
        >
          <label className="field-label" style={{ marginBottom: 14 }}>
            CIDR Blocks to Compare
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {inputs.map((val, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 10, alignItems: "center" }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS[i % COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <input
                  className="input-field"
                  value={val}
                  onChange={(e) => update(i, e.target.value)}
                  placeholder={`e.g. 192.168.${i}.0/24`}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" && compare()}
                />
                {inputs.length > 2 && (
                  <button
                    onClick={() => removeRow(i)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#f87171",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="error-msg" style={{ marginTop: 12 }}>
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn-primary"
              onClick={compare}
              style={{ background: "var(--purple)", color: "#fff" }}
            >
              Compare
            </button>
            <button
              className="btn-secondary"
              onClick={addRow}
              disabled={inputs.length >= 8}
            >
              + Add Row
            </button>
            {results && (
              <button className="btn-secondary" onClick={exportCSV}>
                Export CSV
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => {
                setInputs(["", ""]);
                setResults(null);
                setErrors([]);
              }}
            >
              Reset
            </button>
          </div>

          {/* Presets */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}
          >
            {PRESETS.map((p) => (
              <button
                key={p[0]}
                className="chip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setInputs(p.slice(1));
                  setResults(null);
                }}
              >
                {p[0]}
              </button>
            ))}
          </div>
        </div>

        {sortedResults && (
          <>
            {/* Bar chart comparison */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ padding: 24, marginBottom: 20 }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: 20,
                }}
              >
                Address Space Comparison (log scale)
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {results.map((r, i) => {
                  const logMax = Math.log2(maxAddrs + 1);
                  const logVal = Math.log2(r.totalAddrs + 1);
                  const pct = (logVal / logMax) * 100;
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "DM Mono, monospace",
                            fontSize: 12,
                            color: COLORS[i % COLORS.length],
                          }}
                        >
                          {r.cidr}
                        </span>
                        <span
                          style={{
                            fontFamily: "DM Mono, monospace",
                            fontSize: 12,
                            color: "var(--text-muted)",
                          }}
                        >
                          {r.totalAddrs.toLocaleString()} addresses
                        </span>
                      </div>
                      <div
                        style={{
                          height: 24,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 6,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}99, ${COLORS[i % COLORS.length]}44)`,
                            borderRadius: 6,
                            transition: "width 0.5s",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: 10,
                            fontSize: 11,
                            fontFamily: "DM Mono, monospace",
                            color: "var(--text-muted)",
                          }}
                        >
                          /{r.pfx} • {r.usable.toLocaleString()} usable hosts •
                          Class {r.cls} • {r.isPrivate ? "Private" : "Public"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail table */}
            <div
              className="card animate-fadeInUp stagger-3"
              style={{ overflow: "hidden" }}
            >
              <div style={{ overflowX: "auto" }}>
                <table className="result-table" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 14 }}></th>
                      {[
                        ["CIDR", "cidr"],
                        ["Prefix", "pfx"],
                        ["Network", "network"],
                        ["Broadcast", "broadcast"],
                        ["First Host", "firstHost"],
                        ["Last Host", "lastHost"],
                        ["Total", "totalAddrs"],
                        ["Usable", "usable"],
                        ["Mask", "subnetMask"],
                        ["Wildcard", "wildcard"],
                        ["Class", "cls"],
                      ].map(([label, key]) => (
                        <th
                          key={key}
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          <span style={{ opacity: 0.4, fontSize: 10 }}>
                            <SortIcon k={key} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((r, i) => {
                      const origIdx = results.indexOf(r);
                      return (
                        <tr key={i}>
                          <td>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 2,
                                background: COLORS[origIdx % COLORS.length],
                              }}
                            />
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "DM Mono, monospace",
                                  fontSize: 13,
                                  color: COLORS[origIdx % COLORS.length],
                                }}
                              >
                                {r.cidr}
                              </span>
                              <button
                                className="copy-btn"
                                onClick={() => copy(r.cidr)}
                              >
                                ⎘
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-gold">/{r.pfx}</span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 12,
                              }}
                            >
                              {r.network}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 12,
                                color: "#fd79a8",
                              }}
                            >
                              {r.broadcast}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 12,
                                color: "var(--cyan)",
                              }}
                            >
                              {r.firstHost}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 12,
                                color: "var(--cyan)",
                              }}
                            >
                              {r.lastHost}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div
                                style={{
                                  fontFamily: "DM Mono, monospace",
                                  fontSize: 12,
                                }}
                              >
                                {r.totalAddrs.toLocaleString()}
                              </div>
                              <MiniBar
                                value={r.totalAddrs}
                                max={maxAddrs}
                                color={COLORS[origIdx % COLORS.length]}
                              />
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 12,
                              }}
                            >
                              {r.usable.toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {r.subnetMask}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "DM Mono, monospace",
                                fontSize: 11,
                                color: "var(--orange)",
                              }}
                            >
                              {r.wildcard}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${r.cls === "A" ? "badge-gold" : r.cls === "B" ? "badge-cyan" : r.cls === "C" ? "badge-blue" : "badge-purple"}`}
                            >
                              {r.cls} {r.isPrivate ? "🔒" : "🌐"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: 12,
                marginTop: 16,
              }}
            >
              {[
                { label: "Blocks Compared", value: results.length },
                {
                  label: "Largest Prefix",
                  value: `/${Math.min(...results.map((r) => r.pfx))}`,
                },
                {
                  label: "Smallest Prefix",
                  value: `/${Math.max(...results.map((r) => r.pfx))}`,
                },
                {
                  label: "Total Addresses",
                  value: results
                    .reduce((a, r) => a + r.totalAddrs, 0)
                    .toLocaleString(),
                },
                {
                  label: "Total Usable",
                  value: results
                    .reduce((a, r) => a + r.usable, 0)
                    .toLocaleString(),
                },
                {
                  label: "Private Blocks",
                  value: results.filter((r) => r.isPrivate).length,
                },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ fontSize: 18 }}>
                    {s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link
            to="/"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            ← Home
          </Link>
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
