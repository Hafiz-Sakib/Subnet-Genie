import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

function isValidCIDR(cidr) {
  const p = cidr.trim().split("/");
  if (p.length !== 2) return false;
  const pfx = parseInt(p[1]);
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(p[0]) &&
    p[0].split(".").every((o) => +o >= 0 && +o <= 255) &&
    pfx >= 16 &&
    pfx <= 24
  );
}

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

const ALLOCATION_TYPES = [
  { label: "Servers", color: "#06d6a0", key: "servers" },
  { label: "Workstations", color: "#74b9ff", key: "workstations" },
  { label: "Network Devices", color: "#fabd2f", key: "network" },
  { label: "Reserved", color: "#fd79a8", key: "reserved" },
  { label: "Free", color: "#1a2236", key: "free" },
];

function Toast({ msg, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function IPHeatmap() {
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const [allocations, setAllocations] = useState({});
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("servers");
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState("");
  const [isPainting, setIsPainting] = useState(false);

  const generate = () => {
    setError("");
    if (!isValidCIDR(cidr)) {
      setError("Enter a valid CIDR between /16 and /24 (e.g. 192.168.1.0/24).");
      return;
    }
    const [ip, pfxStr] = cidr.trim().split("/");
    const pfx = parseInt(pfxStr);
    const mask = (0xffffffff << (32 - pfx)) >>> 0;
    const network = (ipToInt(ip) & mask) >>> 0;
    const size = Math.pow(2, 32 - pfx);
    setParsed({ network, pfx, size, ip: intToIP(network) });
    setAllocations({});
  };

  const paint = useCallback(
    (index) => {
      setAllocations((prev) => ({
        ...prev,
        [index]: activeType === "free" ? undefined : activeType,
      }));
    },
    [activeType],
  );

  const clearAll = () => setAllocations({});

  const stats = parsed
    ? (() => {
        const counts = {
          servers: 0,
          workstations: 0,
          network: 0,
          reserved: 0,
          free: 0,
        };
        for (let i = 0; i < parsed.size; i++) {
          counts[allocations[i] || "free"]++;
        }
        return counts;
      })()
    : null;

  // For display, limit to /24 view (256 cells) even for bigger blocks
  const displaySize = parsed ? Math.min(parsed.size, 256) : 0;
  const cols = 16;
  const rows = Math.ceil(displaySize / cols);
  void rows;

  const getColor = (type) =>
    ALLOCATION_TYPES.find((t) => t.key === type)?.color || "#1a2236";

  const exportCSV = () => {
    if (!parsed) return;
    const rows = ["Index,IP Address,Allocation"];
    for (let i = 0; i < parsed.size; i++) {
      rows.push(
        `${i},${intToIP((parsed.network + i) >>> 0)},${allocations[i] || "free"}`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ip_allocation.csv";
    a.click();
    setToast("CSV exported!");
  };

  const presets = [
    {
      label: "Web Server Setup",
      apply: (size) => {
        const a = {};
        for (let i = 1; i <= 5; i++) a[i] = "servers"; // .1-.5 servers
        for (let i = 6; i <= 15; i++) a[i] = "workstations"; // .6-.15 workstations
        a[0] = "reserved"; // network
        a[size - 1] = "reserved"; // broadcast
        for (let i = 250; i <= size - 2; i++) a[i] = "network"; // .250+ network gear
        return a;
      },
    },
    {
      label: "Office Network",
      apply: (size) => {
        const a = {};
        a[0] = "reserved";
        a[size - 1] = "reserved";
        for (let i = 1; i <= 3; i++) a[i] = "network";
        for (let i = 4; i <= 9; i++) a[i] = "servers";
        for (let i = 10; i <= 100; i++) a[i] = "workstations";
        return a;
      },
    },
    {
      label: "Data Center Block",
      apply: (size) => {
        const a = {};
        a[0] = "reserved";
        a[size - 1] = "reserved";
        for (let i = 1; i <= 30; i++) a[i] = "servers";
        for (let i = 240; i <= size - 2; i++) a[i] = "network";
        return a;
      },
    },
  ];

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
            "radial-gradient(circle, rgba(253,121,168,0.07) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding:
            "clamp(32px, 8vw, 48px) clamp(16px, 4vw, 24px) clamp(40px, 8vw, 60px)",
        }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Visualization</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            IP Address Heatmap
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Visually plan and paint IP address allocations within a subnet.
            Click or drag to assign address types.
          </p>
        </div>

        {/* Input */}
        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 28, marginBottom: 20 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 2, minWidth: 200 }}>
              <label className="field-label">Network CIDR (/16 to /24)</label>
              <input
                className="input-field"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                placeholder="192.168.1.0/24"
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>
            <button
              className="btn-primary"
              onClick={generate}
              style={{ background: "#fd79a8", color: "#0a0c10" }}
            >
              Load Network
            </button>
            {parsed && (
              <button className="btn-secondary" onClick={clearAll}>
                Clear All
              </button>
            )}
            {parsed && (
              <button className="btn-secondary" onClick={exportCSV}>
                Export CSV
              </button>
            )}
          </div>
          {error && (
            <div className="error-msg" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}

          {/* Presets */}
          {parsed && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  alignSelf: "center",
                }}
              >
                Quick load:
              </span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  className="chip"
                  style={{ cursor: "pointer" }}
                  onClick={() => setAllocations(p.apply(parsed.size))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {parsed && (
          <div className="responsive-grid">
            {/* Main heatmap */}
            <div>
              {/* Paint tools */}
              <div
                className="card"
                style={{
                  padding: "14px 20px",
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginRight: 4,
                  }}
                >
                  Paint:
                </span>
                {ALLOCATION_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveType(t.key)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1px solid ${activeType === t.key ? t.color : "var(--border-subtle)"}`,
                      background:
                        activeType === t.key ? `${t.color}22` : "transparent",
                      color:
                        activeType === t.key ? t.color : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: t.color,
                      }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="card" style={{ padding: 20 }}>
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  Showing {displaySize} addresses of{" "}
                  {parsed.size.toLocaleString()} total • Click or drag to paint
                  {parsed.size > 256 && (
                    <span style={{ color: "var(--orange)", marginLeft: 8 }}>
                      First 256 shown (/
                      {parsed.pfx +
                        Math.ceil(Math.log2(parsed.size / 256))}{" "}
                      view)
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: 2,
                    userSelect: "none",
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    setIsPainting(false);
                  }}
                >
                  {Array.from({ length: displaySize }, (_, i) => {
                    const ip = intToIP((parsed.network + i) >>> 0);
                    const type = allocations[i] || "free";
                    const isNetwork = i === 0;
                    const isBroadcast = i === displaySize - 1;
                    const color =
                      isNetwork || isBroadcast ? "#fd79a8" : getColor(type);
                    const isHov = hovered === i;

                    return (
                      <div
                        key={i}
                        title={`${ip} (${isNetwork ? "Network" : isBroadcast ? "Broadcast" : type})`}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 3,
                          background: isHov
                            ? "#ffffff33"
                            : color === "#1a2236"
                              ? "#1a2236"
                              : color + "cc",
                          border: `1px solid ${isHov ? "#fff4" : color + "44"}`,
                          cursor: "crosshair",
                          transition: "background 0.05s",
                          boxShadow: isHov ? `0 0 6px ${color}` : "none",
                        }}
                        onMouseEnter={() => {
                          setHovered(i);
                          if (isPainting && !isNetwork && !isBroadcast)
                            paint(i);
                        }}
                        onMouseDown={() => {
                          if (!isNetwork && !isBroadcast) {
                            setIsPainting(true);
                            paint(i);
                          }
                        }}
                        onMouseUp={() => setIsPainting(false)}
                      />
                    );
                  })}
                </div>

                {/* Row labels below */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: 2,
                    marginTop: 4,
                  }}
                >
                  {Array.from({ length: cols }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 9,
                        color: "var(--text-muted)",
                        textAlign: "center",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      .{i}
                    </div>
                  ))}
                </div>

                {/* Hover info */}
                {hovered !== null && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "DM Mono, monospace",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ color: "var(--cyan)" }}>
                      {intToIP((parsed.network + hovered) >>> 0)}
                    </span>
                    <span
                      style={{ color: "var(--text-muted)", marginLeft: 12 }}
                    >
                      Index: .{hovered}
                    </span>
                    <span
                      style={{
                        color: ALLOCATION_TYPES.find(
                          (t) => t.key === (allocations[hovered] || "free"),
                        )?.color,
                        marginLeft: 12,
                      }}
                    >
                      {hovered === 0
                        ? "Network Address"
                        : hovered === displaySize - 1
                          ? "Broadcast Address"
                          : allocations[hovered] || "free"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="card" style={{ padding: 20 }}>
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
                  Allocation Stats
                </div>
                {stats &&
                  ALLOCATION_TYPES.map((t) => {
                    const count = stats[t.key];
                    const pct = ((count / parsed.size) * 100).toFixed(1);
                    return (
                      <div key={t.key} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 11, color: t.color }}>
                            {t.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontFamily: "DM Mono, monospace",
                            }}
                          >
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: t.color,
                              borderRadius: 2,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 12,
                  }}
                >
                  Network Info
                </div>
                {[
                  { label: "Network", value: `${parsed.ip}/${parsed.pfx}` },
                  { label: "Total IPs", value: parsed.size.toLocaleString() },
                  {
                    label: "Usable",
                    value: (parsed.size - 2).toLocaleString(),
                  },
                  {
                    label: "Allocated",
                    value: Object.values(allocations).filter(Boolean).length,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
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
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <Link
            to="/subnet-visual-map"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Visual Map →
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
