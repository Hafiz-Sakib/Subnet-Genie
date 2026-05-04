import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SERIES_COLORS = [
  "#06d6a0",
  "#74b9ff",
  "#fabd2f",
  "#fd79a8",
  "#a29bfe",
  "#fd9644",
];

function generateTimeline(numSubnets, months) {
  const names = [
    "Core LAN",
    "DMZ",
    "Servers",
    "Guest Wi-Fi",
    "IoT Segment",
    "VPN Pool",
  ];
  return Array.from({ length: Math.min(numSubnets, 6) }, (_, i) => {
    let val = Math.floor(Math.random() * 40) + 10;
    const data = [];
    for (let m = 0; m < months; m++) {
      val = Math.min(100, Math.max(1, val + (Math.random() - 0.4) * 15));
      data.push(Math.round(val));
    }
    return {
      name: names[i] || `Subnet ${i + 1}`,
      color: SERIES_COLORS[i],
      data,
    };
  });
}

function LineChart({ series, months, width = 600, height = 280 }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);

  const pad = { top: 16, right: 20, bottom: 36, left: 44 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  // ✅ All hooks are called at the top level (before any early return)
  const handleMouseMove = useCallback(
    (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) * (width / rect.width) - pad.left;
      const idx = Math.round((rawX / cW) * (months - 1));

      if (idx < 0 || idx >= months) {
        setHovered(null);
        return;
      }
      setHovered({ idx, values: series.map((s) => s.data[idx]) });
    },
    [series, months, width, cW, pad.left],
  );

  // Early return AFTER all hooks
  if (!series.length || !series[0]?.data?.length) return null;

  const allValues = series.flatMap((s) => s.data);
  const maxY = Math.max(...allValues, 0) * 1.1;
  const minY = 0;

  const xScale = (i) => (i / (months - 1)) * cW;
  const yScale = (v) => cH - ((v - minY) / (maxY - minY || 1)) * cH;

  const getPath = (data) =>
    data
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"} ${pad.left + xScale(i)} ${pad.top + yScale(v)}`,
      )
      .join(" ");

  const getArea = (data) => {
    const line = data
      .map((v, i) => `${pad.left + xScale(i)} ${pad.top + yScale(v)}`)
      .join(" L ");
    return `M ${pad.left + xScale(0)} ${pad.top + cH} L ${line} L ${pad.left + xScale(data.length - 1)} ${pad.top + cH} Z`;
  };

  const yTicks = [0, 25, 50, 75, 100].filter((v) => v <= maxY + 5);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              x2={pad.left + cW}
              y1={pad.top + yScale(v)}
              y2={pad.top + yScale(v)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={pad.left - 6}
              y={pad.top + yScale(v) + 4}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize={9}
              fontFamily="DM Mono, monospace"
            >
              {v}%
            </text>
          </g>
        ))}

        {/* Month labels */}
        {Array.from(
          { length: months },
          (_, i) =>
            (i % Math.ceil(months / 8) === 0 || i === months - 1) && (
              <text
                key={i}
                x={pad.left + xScale(i)}
                y={pad.top + cH + 18}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={9}
                fontFamily="DM Mono, monospace"
              >
                {MONTHS[i % 12]}
              </text>
            ),
        )}

        {/* Area fills */}
        {series.map((s, si) => (
          <path
            key={si + "area"}
            d={getArea(s.data)}
            fill={s.color}
            opacity={0.07}
          />
        ))}

        {/* Lines */}
        {series.map((s, si) => (
          <path
            key={si}
            d={getPath(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Hover line & dots */}
        {hovered && (
          <>
            <line
              x1={pad.left + xScale(hovered.idx)}
              x2={pad.left + xScale(hovered.idx)}
              y1={pad.top}
              y2={pad.top + cH}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            {series.map((s, si) => (
              <circle
                key={si}
                cx={pad.left + xScale(hovered.idx)}
                cy={pad.top + yScale(s.data[hovered.idx])}
                r={4}
                fill={s.color}
                stroke="var(--bg-deep)"
                strokeWidth={2}
              />
            ))}
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            padding: "10px 14px",
            pointerEvents: "none",
            minWidth: 130,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 6,
              fontFamily: "DM Mono, monospace",
            }}
          >
            {MONTHS[hovered.idx % 12]}
          </div>
          {series.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 3,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {s.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: s.color,
                  fontFamily: "DM Mono, monospace",
                  fontWeight: 700,
                }}
              >
                {hovered.values[i]}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IPTimeline() {
  const [numSubnets, setNumSubnets] = useState(3);
  const [months, setMonths] = useState(12);
  const [series, setSeries] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [customEntries, setCustomEntries] = useState([
    { month: "Jan", subnet: "192.168.1.0/24", util: "" },
  ]);
  const [mode, setMode] = useState("auto");
  const [error, setError] = useState("");

  const generate = () => {
    const s = generateTimeline(numSubnets, months);
    setSeries(s);
    setGenerated(true);
    setError("");
  };

  const addEntry = () => {
    setCustomEntries((prev) => [
      ...prev,
      { month: MONTHS[prev.length % 12], subnet: "", util: "" },
    ]);
  };

  const removeEntry = (i) =>
    setCustomEntries((prev) => prev.filter((_, idx) => idx !== i));

  const updateEntry = (i, field, val) => {
    setCustomEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)),
    );
  };

  const buildManual = () => {
    setError("");
    const valid = customEntries.filter(
      (e) => e.subnet && !isNaN(+e.util) && +e.util >= 0 && +e.util <= 100,
    );
    if (valid.length < 2) {
      setError("Add at least 2 valid entries (subnet + utilization 0–100).");
      return;
    }

    const grouped = {};
    valid.forEach((e) => {
      if (!grouped[e.subnet]) grouped[e.subnet] = [];
      grouped[e.subnet].push({ month: e.month, util: +e.util });
    });

    const colorIdx = { i: 0 };
    const result = Object.entries(grouped).map(([subnet, entries]) => ({
      name: subnet,
      color: SERIES_COLORS[colorIdx.i++ % SERIES_COLORS.length],
      data: entries.map((e) => e.util),
    }));
    setSeries(result);
    setGenerated(true);
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
            "radial-gradient(circle, rgba(162,155,254,0.07) 0%, transparent 70%)",
          bottom: 0,
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
            IP Utilization Timeline
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Track and visualize subnet utilization trends over time with an
            interactive multi-line chart.
          </p>
        </div>

        {/* Mode switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            ["auto", "Auto Generate"],
            ["manual", "Manual Entry"],
          ].map(([k, l]) => (
            <button
              key={k}
              className="btn-secondary"
              onClick={() => setMode(k)}
              style={{
                fontSize: 12,
                borderColor: mode === k ? "var(--purple)" : undefined,
                color: mode === k ? "var(--purple)" : undefined,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: "clamp(18px,4vw,28px)", marginBottom: 20 }}
        >
          {mode === "auto" ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: "1 1 130px" }}>
                <label className="field-label">Subnets to Track</label>
                <select
                  className="input-field"
                  value={numSubnets}
                  onChange={(e) => setNumSubnets(+e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} subnet{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <label className="field-label">Time Period (months)</label>
                <select
                  className="input-field"
                  value={months}
                  onChange={(e) => setMonths(+e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  {[6, 12, 18, 24].map((m) => (
                    <option key={m} value={m}>
                      {m} months
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-primary"
                onClick={generate}
                style={{ background: "#a29bfe", color: "#0a0c10" }}
              >
                Generate Timeline
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                Add Data Points (subnet + month + utilization %)
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {customEntries.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      className="input-field"
                      value={e.month}
                      onChange={(ev) =>
                        updateEntry(i, "month", ev.target.value)
                      }
                      style={{ flex: "0 0 80px", cursor: "pointer" }}
                    >
                      {MONTHS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <input
                      className="input-field"
                      placeholder="10.0.1.0/24"
                      value={e.subnet}
                      onChange={(ev) =>
                        updateEntry(i, "subnet", ev.target.value)
                      }
                      style={{ flex: "2 1 160px" }}
                    />
                    <input
                      className="input-field"
                      type="number"
                      placeholder="0–100"
                      min="0"
                      max="100"
                      value={e.util}
                      onChange={(ev) => updateEntry(i, "util", ev.target.value)}
                      style={{ flex: "1 1 80px" }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => removeEntry(i)}
                      style={{
                        fontSize: 11,
                        padding: "10px 12px",
                        color: "var(--pink)",
                        borderColor: "rgba(253,121,168,0.2)",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn-secondary"
                  onClick={addEntry}
                  style={{ fontSize: 12 }}
                >
                  + Add Row
                </button>
                <button
                  className="btn-primary"
                  onClick={buildManual}
                  style={{ background: "#a29bfe", color: "#0a0c10" }}
                >
                  Plot Chart
                </button>
              </div>
            </div>
          )}

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

        {generated && series.length > 0 && (
          <>
            {/* Legend */}
            <div
              className="card animate-fadeInUp stagger-1"
              style={{
                padding: "clamp(14px,3vw,20px)",
                marginBottom: 14,
                display: "flex",
                gap: "10px 20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginRight: 4,
                }}
              >
                Subnets:
              </span>
              {series.map((s, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 3,
                      background: s.color,
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{ fontSize: 11, color: "var(--text-secondary)" }}
                  >
                    {s.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ padding: "clamp(18px,4vw,28px)", marginBottom: 16 }}
            >
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                Utilization % Over Time — hover to inspect
              </div>
              <LineChart
                series={series}
                months={
                  mode === "manual"
                    ? Math.max(...series.map((s) => s.data.length))
                    : months
                }
              />
            </div>

            {/* Stats table */}
            <div
              className="card animate-fadeInUp stagger-3"
              style={{ padding: "clamp(18px,4vw,28px)" }}
            >
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
                Summary Statistics
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Subnet",
                        "Min %",
                        "Max %",
                        "Avg %",
                        "Trend",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            fontSize: 10,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            borderBottom: "1px solid var(--border-subtle)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {series.map((s, i) => {
                      const min = Math.min(...s.data),
                        max = Math.max(...s.data);
                      const avg = Math.round(
                        s.data.reduce((a, b) => a + b, 0) / s.data.length,
                      );
                      const trend = s.data[s.data.length - 1] - s.data[0];
                      const last = s.data[s.data.length - 1];
                      const status =
                        last > 85
                          ? { label: "Critical", color: "#fd79a8" }
                          : last > 60
                            ? { label: "High", color: "#fabd2f" }
                            : { label: "Normal", color: "#06d6a0" };

                      return (
                        <tr key={i}>
                          <td
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: s.color,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ color: "var(--text-secondary)" }}>
                                {s.name}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "var(--cyan)",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            {min}%
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "var(--pink)",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            {max}%
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "var(--text-secondary)",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            {avg}%
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: trend >= 0 ? "#fd79a8" : "#06d6a0",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            <span
                              style={{
                                color: status.color,
                                background: status.color + "18",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 700,
                                fontFamily: "Syne, sans-serif",
                                textTransform: "uppercase",
                              }}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
            to="/subnet-efficiency"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Efficiency Chart →
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
