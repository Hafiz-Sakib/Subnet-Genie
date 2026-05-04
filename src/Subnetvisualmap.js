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
function isValidIP(ip) {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every((o) => +o >= 0 && +o <= 255)
  );
}

const PALETTE = [
  "#fabd2f",
  "#06d6a0",
  "#74b9ff",
  "#fd79a8",
  "#a29bfe",
  "#fd9644",
  "#55efc4",
  "#ffd166",
  "#81ecec",
  "#e17055",
];

function buildSubnetTree(baseIP, prefixLen, splits) {
  const mask = prefixLen === 0 ? 0 : (0xffffffff << (32 - prefixLen)) >>> 0;
  const network = (ipToInt(baseIP) & mask) >>> 0;

  function buildNode(addr, prefix, depth) {
    const sz = Math.pow(2, 32 - prefix);
    const broadcast = (addr + sz - 1) >>> 0;
    const node = {
      network: intToIP(addr),
      prefix,
      size: sz,
      broadcast: intToIP(broadcast),
      firstHost: intToIP(addr + 1),
      lastHost: intToIP(broadcast - 1),
      usable: sz - 2,
      children: [],
      depth,
      addr,
    };
    if (depth < splits && prefix < 30) {
      const childPrefix = prefix + 1;
      const childSize = Math.pow(2, 32 - childPrefix);
      node.children = [
        buildNode(addr, childPrefix, depth + 1),
        buildNode((addr + childSize) >>> 0, childPrefix, depth + 1),
      ];
    }
    return node;
  }
  return buildNode(network, prefixLen, 0);
}

function SubnetNode({
  node,
  depth,
  totalSize,
  startOffset,
  onSelect,
  selected,
  colorIndex,
}) {
  const widthPct = (node.size / totalSize) * 100;
  const leftPct = (startOffset / totalSize) * 100;
  const color = PALETTE[colorIndex % PALETTE.length];
  const isLeaf = node.children.length === 0;
  const isSelected =
    selected &&
    selected.network === node.network &&
    selected.prefix === node.prefix;

  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: depth * 64,
        height: 52,
      }}
    >
      <div
        onClick={() => onSelect(node)}
        style={{
          position: "absolute",
          inset: "2px 1px",
          background: isLeaf ? `${color}22` : `${color}11`,
          border: `1px solid ${isSelected ? color : color + "55"}`,
          borderRadius: 6,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.2s",
          boxShadow: isSelected ? `0 0 12px ${color}44` : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${color}33`;
          e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isLeaf
            ? `${color}22`
            : `${color}11`;
          e.currentTarget.style.borderColor = isSelected ? color : color + "55";
        }}
      >
        {widthPct > 8 && (
          <>
            <div
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: Math.min(11, widthPct * 0.8),
                color,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {node.network}/{node.prefix}
            </div>
            {widthPct > 16 && (
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: Math.min(9, widthPct * 0.6),
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {node.size.toLocaleString()} IPs
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function flattenTree(node, offset, colorBase) {
  const nodes = [{ ...node, offset, colorBase }];
  if (node.children.length > 0) {
    nodes.push(...flattenTree(node.children[0], offset, colorBase * 2));
    nodes.push(
      ...flattenTree(
        node.children[1],
        offset + node.children[1].addr - node.addr,
        colorBase * 2 + 1,
      ),
    );
  }
  return nodes;
}

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function SubnetVisualMap() {
  const [baseIP, setBaseIP] = useState("10.0.0.0");
  const [prefix, setPrefix] = useState("16");
  const [splits, setSplits] = useState(3);
  const [tree, setTree] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const generate = () => {
    setError("");
    if (!isValidIP(baseIP)) {
      setError("Invalid IP address.");
      return;
    }
    const pfx = parseInt(prefix);
    if (isNaN(pfx) || pfx < 0 || pfx > 28) {
      setError("Prefix must be 0–28.");
      return;
    }
    setTree(buildSubnetTree(baseIP, pfx, splits));
    setSelected(null);
  };

  const copy = (t) =>
    navigator.clipboard.writeText(t).then(() => setToast("Copied!"));

  const maxDepth = splits + 1;
  const allNodes = tree ? flattenTree(tree, 0, 0) : [];
  const totalSize = tree ? tree.size : 1;

  const examples = [
    { ip: "10.0.0.0", prefix: "8", splits: 2, label: "10.0.0.0/8" },
    { ip: "192.168.0.0", prefix: "16", splits: 3, label: "192.168.0.0/16" },
    { ip: "172.16.0.0", prefix: "20", splits: 2, label: "172.16.0.0/20" },
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
            "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)",
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
          <div className="section-tag">Visualization</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Subnet Visual Map
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Visualize how a network splits into subnets recursively. Click any
            block to inspect it.
          </p>
        </div>

        {/* Controls */}
        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 28, marginBottom: 24 }}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 2, minWidth: 160 }}>
              <label className="field-label">Base Network IP</label>
              <input
                className="input-field"
                value={baseIP}
                onChange={(e) => setBaseIP(e.target.value)}
                placeholder="10.0.0.0"
              />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label className="field-label">Prefix (/)</label>
              <input
                className="input-field"
                type="number"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="16"
                min="0"
                max="28"
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="field-label">Split Depth (1–4)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSplits(d)}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      borderRadius: 8,
                      border: `1px solid ${splits === d ? "var(--cyan)" : "var(--border-subtle)"}`,
                      background:
                        splits === d ? "rgba(6,214,160,0.12)" : "transparent",
                      color: splits === d ? "var(--cyan)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={generate}
              style={{
                background: "var(--cyan)",
                color: "#0a0c10",
                alignSelf: "flex-end",
              }}
            >
              Generate Map
            </button>
          </div>

          {/* Quick examples */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}
          >
            {examples.map((ex) => (
              <button
                key={ex.label}
                className="chip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setBaseIP(ex.ip);
                  setPrefix(ex.prefix);
                  setSplits(ex.splits);
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
          {error && (
            <div className="error-msg" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>

        {tree && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selected ? "1fr 280px" : "1fr",
              gap: 20,
            }}
          >
            {/* Visual map */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ padding: 24, overflow: "hidden" }}
            >
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                  }}
                >
                  {tree.network}/{tree.prefix} → {splits} levels deep
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Click any block to inspect
                </span>
              </div>

              {/* Depth labels */}
              <div
                className="subnet-map-container"
                style={{ position: "relative", overflowX: "auto" }}
              >
                <div
                  style={{
                    position: "relative",
                    height: maxDepth * 64 + 8,
                    minWidth: 600,
                  }}
                >
                  {/* Depth row labels */}
                  {Array.from({ length: maxDepth }, (_, d) => (
                    <div
                      key={d}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: d * 64 + 14,
                        fontSize: 10,
                        color: "var(--text-muted)",
                        fontFamily: "DM Mono, monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      /{parseInt(prefix) + d}
                    </div>
                  ))}

                  {/* Subnet blocks */}
                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                      marginLeft: 32,
                    }}
                  >
                    {allNodes.map((node, i) => (
                      <SubnetNode
                        key={`${node.network}/${node.prefix}`}
                        node={node}
                        depth={node.depth}
                        totalSize={totalSize}
                        startOffset={node.offset}
                        onSelect={setSelected}
                        selected={selected}
                        colorIndex={node.colorBase}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {PALETTE.slice(0, Math.min(splits + 1, 5)).map((color, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: color,
                      }}
                    />
                    Level {i + 1} (/{parseInt(prefix) + i})
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector panel */}
            {selected && (
              <div
                className="card animate-fadeInUp"
                style={{ padding: 24, alignSelf: "start" }}
              >
                <div
                  style={{
                    marginBottom: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                    }}
                  >
                    Subnet Detail
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--cyan)",
                    marginBottom: 16,
                  }}
                >
                  {selected.network}/{selected.prefix}
                </div>

                {[
                  { label: "Network", value: selected.network },
                  { label: "Broadcast", value: selected.broadcast },
                  { label: "First Host", value: selected.firstHost },
                  { label: "Last Host", value: selected.lastHost },
                  {
                    label: "Block Size",
                    value: selected.size.toLocaleString(),
                  },
                  {
                    label: "Usable Hosts",
                    value: Math.max(0, selected.usable).toLocaleString(),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          fontFamily: "DM Mono, monospace",
                        }}
                      >
                        {value}
                      </span>
                      <button
                        className="copy-btn"
                        onClick={() => copy(String(value))}
                      >
                        ⎘
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            to="/ip-heatmap"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            IP Heatmap →
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
