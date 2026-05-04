import React, { useState } from "react";
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
    pfx >= 8 &&
    pfx <= 30
  );
}

const CATEGORIES = [
  { key: "servers", label: "Servers", color: "#06d6a0" },
  { key: "workstations", label: "Workstations", color: "#74b9ff" },
  { key: "networking", label: "Network Devices", color: "#fabd2f" },
  { key: "reserved", label: "Reserved", color: "#fd79a8" },
  { key: "iot", label: "IoT Devices", color: "#a29bfe" },
  { key: "free", label: "Unallocated", color: "#1e2d45" },
];

function DonutChart({ data, total, size = 240 }) {
  const cx = size / 2,
    cy = size / 2;
  const outerR = size / 2 - 12;
  const innerR = outerR * 0.58;
  let cumulative = 0;
  const [hovered, setHovered] = useState(null);

  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const start = cumulative;
      const fraction = d.value / total;
      cumulative += fraction;
      const startAngle = start * 2 * Math.PI - Math.PI / 2;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const largeArc = fraction > 0.5 ? 1 : 0;
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);
      const ix1 = cx + innerR * Math.cos(endAngle);
      const iy1 = cy + innerR * Math.sin(endAngle);
      const ix2 = cx + innerR * Math.cos(startAngle);
      const iy2 = cy + innerR * Math.sin(startAngle);
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      return {
        ...d,
        path: `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`,
        midAngle,
        fraction,
      };
    });

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {slices.map((s, i) => {
          const isHov = hovered === i;
          const offset = isHov ? 8 : 0;
          const mx = cx + offset * Math.cos(s.midAngle);
          const my = cy + offset * Math.sin(s.midAngle);
          return (
            <g
              key={s.key}
              transform={`translate(${mx - cx}, ${my - cy})`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
            >
              <path
                d={s.path}
                fill={s.color}
                opacity={hovered !== null && !isHov ? 0.45 : 1}
                style={{ transition: "opacity 0.2s" }}
                filter={
                  isHov ? "drop-shadow(0 0 8px " + s.color + "88)" : "none"
                }
              />
            </g>
          );
        })}
        {/* Center text */}
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontFamily="Syne, sans-serif"
          fontWeight={800}
          fontSize={22}
        >
          {hoveredSlice
            ? hoveredSlice.value.toLocaleString()
            : total.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontFamily="DM Mono, monospace"
          fontSize={10}
        >
          {hoveredSlice ? hoveredSlice.label : "Total IPs"}
        </text>
        {hoveredSlice && (
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            fill={hoveredSlice.color}
            fontFamily="DM Mono, monospace"
            fontSize={11}
          >
            {(hoveredSlice.fraction * 100).toFixed(1)}%
          </text>
        )}
      </svg>
    </div>
  );
}

export default function SubnetPieChart() {
  const [cidr, setCidr] = useState("192.168.0.0/24");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [allocs, setAllocs] = useState(
    CATEGORIES.filter((c) => c.key !== "free").map((c) => ({
      key: c.key,
      count: "",
    })),
  );

  const calculate = () => {
    setError("");
    if (!isValidCIDR(cidr)) {
      setError("Enter a valid CIDR (e.g. 192.168.0.0/24, prefix /8–/30).");
      return;
    }
    const [ip, pfxStr] = cidr.trim().split("/");
    const pfx = parseInt(pfxStr);
    const mask = (0xffffffff << (32 - pfx)) >>> 0;
    const network = (ipToInt(ip) & mask) >>> 0;
    const total = Math.pow(2, 32 - pfx);
    const usable = Math.max(0, total - 2);

    console.log({ network: intToIP(network), total, usable });

    let allocated = 0;
    const counts = {};
    for (const a of allocs) {
      const n = parseInt(a.count) || 0;
      counts[a.key] = n;
      allocated += n;
    }
    if (allocated > usable) {
      setError(`Allocated (${allocated}) exceeds usable hosts (${usable}).`);
      return;
    }
    counts.free = total - allocated;
    counts.reserved = 2; // network + broadcast always
    counts.free = Math.max(0, total - allocated - 2);

    const chartData = CATEGORIES.map((c) => ({
      ...c,
      value: counts[c.key] || 0,
    }));
    const networkAddr = intToIP(network >>> 0);
    const broadcast = intToIP((network + total - 1) >>> 0);
    const firstUsable = pfx < 31 ? intToIP((network + 1) >>> 0) : networkAddr;
    const lastUsable =
      pfx < 31 ? intToIP((network + total - 2) >>> 0) : broadcast;

    setResult({
      total,
      usable,
      allocated,
      networkAddr,
      broadcast,
      firstUsable,
      lastUsable,
      pfx,
      chartData,
    });
  };

  const updateAlloc = (key, val) => {
    setAllocs((prev) =>
      prev.map((a) => (a.key === key ? { ...a, count: val } : a)),
    );
  };

  const applyPreset = (preset) => {
    const usable = result ? result.usable : 254;
    console.log("Applying preset", preset, "with usable IPs:", usable);
    const presets = {
      office: {
        servers: 10,
        workstations: 80,
        networking: 5,
        reserved: 5,
        iot: 10,
      },
      datacenter: {
        servers: 120,
        workstations: 10,
        networking: 20,
        reserved: 10,
        iot: 0,
      },
      campus: {
        servers: 20,
        workstations: 150,
        networking: 15,
        reserved: 5,
        iot: 50,
      },
    };
    const p = presets[preset];
    setAllocs(
      CATEGORIES.filter((c) => c.key !== "free").map((c) => ({
        key: c.key,
        count: String(p[c.key] || 0),
      })),
    );
  };

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
            "radial-gradient(circle, rgba(6,214,160,0.07) 0%, transparent 70%)",
          top: -100,
          left: -100,
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
            Subnet Allocation Pie Chart
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Visualize how IP addresses are distributed across device categories
            in any subnet.
          </p>
        </div>

        {/* Input card */}
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
              marginBottom: 20,
            }}
          >
            <div style={{ flex: "2 1 200px" }}>
              <label className="field-label">Network CIDR</label>
              <input
                className="input-field"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                placeholder="192.168.0.0/24"
                onKeyDown={(e) => e.key === "Enter" && calculate()}
              />
            </div>
            <button
              className="btn-primary"
              onClick={calculate}
              style={{ background: "#06d6a0", color: "#0a0c10" }}
            >
              Generate Chart
            </button>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Quick Presets
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["office", "Office LAN"],
                ["datacenter", "Data Center"],
                ["campus", "Campus Network"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "7px 14px" }}
                  onClick={() => applyPreset(k)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation inputs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {CATEGORIES.filter((c) => c.key !== "free").map((cat) => (
              <div key={cat.key}>
                <label
                  style={{
                    fontSize: 11,
                    color: cat.color,
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {cat.label}
                </label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={allocs.find((a) => a.key === cat.key)?.count || ""}
                  onChange={(e) => updateAlloc(cat.key, e.target.value)}
                  style={{ borderColor: cat.color + "33" }}
                />
              </div>
            ))}
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

        {/* Results */}
        {result && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {/* Donut */}
            <div
              className="card animate-fadeInUp"
              style={{
                padding: "clamp(18px,4vw,28px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
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
                  alignSelf: "flex-start",
                }}
              >
                Allocation Overview
              </div>
              <DonutChart
                data={result.chartData}
                total={result.total}
                size={Math.min(240, window.innerWidth - 80)}
              />
              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 16px",
                  justifyContent: "center",
                }}
              >
                {result.chartData
                  .filter((d) => d.value > 0)
                  .map((d) => (
                    <div
                      key={d.key}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: d.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{ fontSize: 11, color: "var(--text-secondary)" }}
                      >
                        {d.label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Network info */}
              <div className="card" style={{ padding: "clamp(16px,4vw,22px)" }}>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 14,
                  }}
                >
                  Network Info
                </div>
                {[
                  ["Network", `${result.networkAddr}/${result.pfx}`],
                  ["Broadcast", result.broadcast],
                  ["First Usable", result.firstUsable],
                  ["Last Usable", result.lastUsable],
                  ["Total IPs", result.total.toLocaleString()],
                  ["Usable Hosts", result.usable.toLocaleString()],
                  ["Allocated", result.allocated.toLocaleString()],
                  ["Free", (result.usable - result.allocated).toLocaleString()],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {l}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown bars */}
              <div className="card" style={{ padding: "clamp(16px,4vw,22px)" }}>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 14,
                  }}
                >
                  Breakdown
                </div>
                {result.chartData
                  .filter((d) => d.value > 0)
                  .map((d) => {
                    const pct = ((d.value / result.total) * 100).toFixed(1);
                    return (
                      <div key={d.key} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 11, color: d.color }}>
                            {d.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontFamily: "DM Mono, monospace",
                            }}
                          >
                            {d.value} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: d.color,
                              borderRadius: 3,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
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
            to="/iptimeline"
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
