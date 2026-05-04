import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
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
    pfx >= 16 &&
    pfx <= 28
  );
}
function maskFromPrefix(pfx) {
  return (0xffffffff << (32 - pfx)) >>> 0;
}

const PROTOCOLS = [
  { key: "http", label: "HTTP/S", color: "#06d6a0" },
  { key: "ssh", label: "SSH", color: "#74b9ff" },
  { key: "dns", label: "DNS", color: "#fabd2f" },
  { key: "smtp", label: "SMTP", color: "#fd79a8" },
  { key: "ftp", label: "FTP", color: "#a29bfe" },
  { key: "icmp", label: "ICMP", color: "#fd9644" },
];

function BarChart({ subnets, metric }) {
  const [hovered, setHovered] = useState(null);
  if (!subnets.length) return null;

  const maxVal = Math.max(...subnets.map((s) => s[metric]));
  const chartH = 200;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div
        style={{
          minWidth: Math.max(subnets.length * 70, 300),
          padding: "0 8px",
        }}
      >
        {/* Y-axis labels */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: chartH,
              marginRight: 8,
              paddingBottom: 22,
            }}
          >
            {[100, 75, 50, 25, 0].map((v) => (
              <span
                key={v}
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  fontFamily: "DM Mono, monospace",
                  lineHeight: 1,
                }}
              >
                {metric === "bandwidth"
                  ? `${Math.round((maxVal * v) / 100)} Mbps`
                  : `${v}%`}
              </span>
            ))}
          </div>

          {/* Bars */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: chartH,
              position: "relative",
            }}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <div
                key={f}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 22 + f * (chartH - 22),
                  height: 1,
                  background: "rgba(255,255,255,0.04)",
                }}
              />
            ))}

            {subnets.map((s, i) => {
              const barH =
                maxVal > 0 ? (s[metric] / maxVal) * (chartH - 28) : 0;
              const isHov = hovered === i;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHov && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: chartH - 4,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        zIndex: 10,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          fontFamily: "DM Mono, monospace",
                        }}
                      >
                        {s.subnet}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: s.color,
                          fontFamily: "Syne, sans-serif",
                          fontWeight: 700,
                          marginTop: 2,
                        }}
                      >
                        {metric === "bandwidth"
                          ? `${s.bandwidth} Mbps`
                          : `${s.utilization}%`}
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      width: "70%",
                      height: barH,
                      background: s.color,
                      borderRadius: "4px 4px 0 0",
                      opacity: hovered !== null && !isHov ? 0.4 : 1,
                      transition: "all 0.3s ease",
                      boxShadow: isHov ? `0 0 16px ${s.color}66` : "none",
                      transform: isHov ? "scaleX(1.08)" : "scaleX(1)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 8,
                      color: "var(--text-muted)",
                      fontFamily: "DM Mono, monospace",
                      marginTop: 4,
                      textAlign: "center",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      padding: "0 2px",
                    }}
                  >
                    {s.subnet.split("/")[0].split(".").slice(-2).join(".")}/
                    <span style={{ color: "var(--text-secondary)" }}>
                      {s.subnet.split("/")[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtocolChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const W = 300,
    H = 14,
    gap = 3;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ borderRadius: 6, overflow: "hidden" }}
      >
        {data.map((d, i) => {
          const w =
            total > 0 ? (d.value / total) * (W - gap * (data.length - 1)) : 0;
          const x = cum;
          cum += w + gap;
          return (
            <rect
              key={d.key}
              x={x}
              y={0}
              width={w}
              height={H}
              fill={d.color}
              opacity={hovered !== null && hovered !== i ? 0.35 : 1}
              style={{ transition: "opacity 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              rx={3}
            />
          );
        })}
      </svg>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 14px",
          marginTop: 10,
        }}
      >
        {data.map((d, i) => (
          <div
            key={d.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: hovered !== null && hovered !== i ? 0.4 : 1,
              transition: "opacity 0.2s",
              cursor: "default",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
              {d.label}
            </span>
            <span
              style={{
                fontSize: 10,
                color: d.color,
                fontFamily: "DM Mono, monospace",
              }}
            >
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSubnetTraffic(parentCIDR, numSubnets) {
  const [ip, pfxStr] = parentCIDR.trim().split("/");
  const pfx = parseInt(pfxStr);
  const subPfx = pfx + Math.ceil(Math.log2(numSubnets));
  if (subPfx > 30) return [];
  const network = (ipToInt(ip) & maskFromPrefix(pfx)) >>> 0;
  const subnetSize = Math.pow(2, 32 - subPfx);
  const colors = [
    "#06d6a0",
    "#74b9ff",
    "#fabd2f",
    "#fd79a8",
    "#a29bfe",
    "#fd9644",
    "#ff6b6b",
    "#00cec9",
  ];
  const names = [
    "Web Tier",
    "App Tier",
    "DB Tier",
    "Cache",
    "Admin",
    "DMZ",
    "Mgmt",
    "Dev",
  ];

  return Array.from({ length: Math.min(numSubnets, 8) }, (_, i) => {
    const subNet = (network + i * subnetSize) >>> 0;
    const bw = Math.floor(Math.random() * 900) + 50;
    const util = Math.floor(Math.random() * 85) + 5;
    const proto = PROTOCOLS.map((p) => ({
      ...p,
      value: Math.floor(Math.random() * 40) + 5,
    }));
    const pTotal = proto.reduce((s, p) => s + p.value, 0);
    proto.forEach((p) => (p.value = Math.round((p.value / pTotal) * 100)));
    return {
      subnet: `${intToIP(subNet)}/${subPfx}`,
      name: names[i] || `Subnet ${i + 1}`,
      color: colors[i % colors.length],
      bandwidth: bw,
      utilization: util,
      protocols: proto,
      hosts: subnetSize - 2,
      activeHosts: Math.floor(Math.random() * (subnetSize - 2)) + 1,
      packetsPerSec: Math.floor(Math.random() * 50000) + 1000,
    };
  });
}

export default function NetworkTrafficChart() {
  const [cidr, setCidr] = useState("10.0.0.0/20");
  const [numSubnets, setNumSubnets] = useState(4);
  const [error, setError] = useState("");
  const [subnets, setSubnets] = useState([]);
  const [metric, setMetric] = useState("bandwidth");
  const [live, setLive] = useState(false);
  const [tick, setTick] = useState(0);

  const generate = () => {
    setError("");
    if (!isValidCIDR(cidr)) {
      setError("Enter a valid CIDR between /16 and /28.");
      return;
    }
    const result = generateSubnetTraffic(cidr, numSubnets);
    if (!result.length) {
      setError(
        "Cannot subdivide: prefix too deep. Try a larger block or fewer subnets.",
      );
      return;
    }
    setSubnets(result);
  };

  useEffect(() => {
    if (!live || !subnets.length) return;
    const id = setInterval(() => {
      setSubnets((prev) =>
        prev.map((s) => ({
          ...s,
          bandwidth: Math.max(10, s.bandwidth + (Math.random() - 0.5) * 100),
          utilization: Math.min(
            100,
            Math.max(1, s.utilization + (Math.random() - 0.5) * 10),
          ),
          packetsPerSec: Math.max(
            100,
            s.packetsPerSec + Math.floor((Math.random() - 0.5) * 5000),
          ),
        })),
      );
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(id);
  }, [live, subnets.length]);

  const totals = subnets.length
    ? {
        bandwidth: subnets.reduce((s, n) => s + n.bandwidth, 0),
        avgUtil: Math.round(
          subnets.reduce((s, n) => s + n.utilization, 0) / subnets.length,
        ),
        activeHosts: subnets.reduce((s, n) => s + n.activeHosts, 0),
        totalHosts: subnets.reduce((s, n) => s + n.hosts, 0),
        packets: subnets.reduce((s, n) => s + n.packetsPerSec, 0),
      }
    : null;

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
            "radial-gradient(circle, rgba(116,185,255,0.07) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />
      <NavBar />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(32px,8vw,48px) clamp(16px,4vw,24px) 60px",
        }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Visualization</div>
          <h1
            style={{
              fontSize: "clamp(26px,5vw,36px)",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Network Traffic Analyzer
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Visualize bandwidth usage, utilization rates, and protocol
            distribution across subnets.
          </p>
        </div>

        {/* Controls */}
        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: "clamp(18px,4vw,28px)", marginBottom: 20 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "2 1 180px" }}>
              <label className="field-label">
                Parent Network CIDR (/16–/28)
              </label>
              <input
                className="input-field"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                placeholder="10.0.0.0/20"
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <label className="field-label">Number of Subnets</label>
              <select
                className="input-field"
                value={numSubnets}
                onChange={(e) => setNumSubnets(+e.target.value)}
                style={{ cursor: "pointer" }}
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} subnets
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={generate}
              style={{ background: "#74b9ff", color: "#0a0c10" }}
            >
              Analyze
            </button>
            {subnets.length > 0 && (
              <button
                className="btn-secondary"
                onClick={() => setLive((l) => !l)}
                style={{
                  borderColor: live ? "var(--cyan)" : undefined,
                  color: live ? "var(--cyan)" : undefined,
                }}
              >
                {live ? "⏸ Pause" : "▶ Live"}
              </button>
            )}
          </div>
          {error && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "rgba(253,121,168,0.1)",
                border: "1px solid rgba(253,121,168,0.3)",
                borderRadius: 8,
                fontSize: 12,
                color: "#fd79a8",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {subnets.length > 0 && (
          <>
            {/* Summary stats */}
            {totals && (
              <div
                className="card animate-fadeInUp stagger-1"
                style={{
                  padding: "20px 28px",
                  marginBottom: 16,
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                }}
              >
                {[
                  {
                    label: "Total Bandwidth",
                    value: `${Math.round(totals.bandwidth)} Mbps`,
                    color: "var(--blue)",
                  },
                  {
                    label: "Avg Utilization",
                    value: `${totals.avgUtil}%`,
                    color:
                      totals.avgUtil > 70
                        ? "var(--pink)"
                        : totals.avgUtil > 40
                          ? "var(--gold)"
                          : "var(--cyan)",
                  },
                  {
                    label: "Active Hosts",
                    value: `${totals.activeHosts}/${totals.totalHosts}`,
                    color: "var(--cyan)",
                  },
                  {
                    label: "Total Packets/s",
                    value: totals.packets.toLocaleString(),
                    color: "var(--purple)",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "clamp(18px,3vw,24px)",
                        fontWeight: 800,
                        color,
                        fontFamily: "Syne, sans-serif",
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginTop: 2,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bar chart */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ padding: "clamp(18px,4vw,28px)", marginBottom: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                  }}
                >
                  {metric === "bandwidth"
                    ? "Bandwidth Usage (Mbps)"
                    : "Utilization (%)"}
                  {live && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--cyan)",
                        animation: "pulse-glow 1s infinite",
                      }}
                    >
                      ● LIVE
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    ["bandwidth", "Bandwidth"],
                    ["utilization", "Utilization"],
                  ].map(([k, l]) => (
                    <button
                      key={k}
                      className="btn-secondary"
                      onClick={() => setMetric(k)}
                      style={{
                        fontSize: 11,
                        padding: "6px 12px",
                        borderColor: metric === k ? "var(--blue)" : undefined,
                        color: metric === k ? "var(--blue)" : undefined,
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart
                subnets={subnets.map((s) => ({
                  ...s,
                  [metric]:
                    metric === "bandwidth"
                      ? Math.round(s.bandwidth)
                      : Math.round(s.utilization),
                }))}
                metric={metric}
              />
            </div>

            {/* Per-subnet cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              {subnets.map((s, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "clamp(14px,3vw,20px)",
                    borderColor: s.color + "33",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: s.color,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {s.subnet}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      ["BW", `${Math.round(s.bandwidth)} Mbps`],
                      ["Util", `${Math.round(s.utilization)}%`],
                      ["Hosts", `${s.activeHosts}/${s.hosts}`],
                      ["Pkts/s", s.packetsPerSec.toLocaleString()],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 6,
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                          }}
                        >
                          {l}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                            fontFamily: "DM Mono, monospace",
                            marginTop: 2,
                          }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 6,
                    }}
                  >
                    Protocol Mix
                  </div>
                  <ProtocolChart data={s.protocols} />
                </div>
              ))}
            </div>
          </>
        )}

        <div
          style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}
        >
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
          <Link
            to="/ip-timeline"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            IP Timeline →
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
