import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";
import "./App.css";

function isValidIP(ip) {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every((o) => +o >= 0 && +o <= 255)
  );
}

function ipToInt(ip) {
  const o = ip.split(".").map(Number);
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

function parseCIDR(cidr) {
  const [ip, pfx] = cidr.trim().split("/");
  const prefix = parseInt(pfx);
  if (!isValidIP(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipToInt(ip) & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { cidr: cidr.trim(), ip, prefix, network, broadcast, mask };
}

function subnetsOverlap(a, b) {
  return a.network <= b.broadcast && b.network <= a.broadcast;
}

function Toast({ msg, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function OverlapDetector() {
  const [subnets, setSubnets] = useState(["", "", ""]);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [toast, setToast] = useState("");

  const updateSubnet = (i, val) => {
    const updated = [...subnets];
    updated[i] = val;
    setSubnets(updated);
    setResult(null);
  };

  const addSubnet = () => {
    if (subnets.length < 10) setSubnets([...subnets, ""]);
  };

  const removeSubnet = (i) => {
    if (subnets.length > 2) setSubnets(subnets.filter((_, idx) => idx !== i));
  };

  const detect = () => {
    const errs = [];
    const parsed = subnets.map((s, i) => {
      if (!s.trim()) {
        errs.push(`Subnet ${i + 1}: empty`);
        return null;
      }
      const p = parseCIDR(s);
      if (!p) {
        errs.push(`Subnet ${i + 1}: invalid CIDR "${s}"`);
        return null;
      }
      return p;
    });

    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    const overlaps = [];
    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        if (subnetsOverlap(parsed[i], parsed[j])) {
          overlaps.push({ a: parsed[i].cidr, b: parsed[j].cidr, ai: i, bi: j });
        }
      }
    }

    setResult({ subnets: parsed, overlaps, hasOverlap: overlaps.length > 0 });
  };

  const presets = [
    ["10.0.0.0/8", "10.0.1.0/24", "192.168.0.0/16"],
    ["192.168.1.0/25", "192.168.1.128/25", "10.0.0.0/24"],
    ["172.16.0.0/12", "172.20.0.0/24", "172.16.5.0/24"],
  ];

  const intToIP = (n) =>
    [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(
      ".",
    );

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
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Subnet Overlap Detector</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Overlap Detector
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Check if any subnets in your design conflict — enter multiple CIDR
            blocks to detect overlaps instantly.
          </p>
        </div>

        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 32, marginBottom: 20 }}
        >
          <div style={{ marginBottom: 18 }}>
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
              CIDR Blocks (e.g. 192.168.1.0/24)
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {subnets.map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 10, alignItems: "center" }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "rgba(6,214,160,0.1)",
                    border: "1px solid rgba(6,214,160,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    color: "var(--cyan)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <input
                  className="input-field"
                  value={s}
                  onChange={(e) => updateSubnet(i, e.target.value)}
                  placeholder={`Subnet ${i + 1} (e.g. 192.168.${i}.0/24)`}
                  style={{ flex: 1 }}
                />
                {subnets.length > 2 && (
                  <button
                    onClick={() => removeSubnet(i)}
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 6,
                      color: "#f87171",
                      cursor: "pointer",
                      padding: "6px 10px",
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {subnets.length < 10 && (
              <button
                className="btn-secondary"
                onClick={addSubnet}
                style={{ fontSize: 12 }}
              >
                + Add Subnet
              </button>
            )}
            <button className="btn-cyan" onClick={detect}>
              Detect Overlaps
            </button>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
              }}
            >
              Quick presets
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {presets.map((p, i) => (
              <button
                key={i}
                className="chip"
                style={{ cursor: "pointer", fontSize: 10 }}
                onClick={() => {
                  setSubnets(p);
                  setResult(null);
                  setErrors([]);
                }}
              >
                Preset {i + 1}
              </button>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
        </div>

        {result && (
          <>
            {/* Summary banner */}
            <div
              className="animate-fadeInUp stagger-1"
              style={{
                padding: 20,
                borderRadius: 10,
                marginBottom: 16,
                background: result.hasOverlap
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(6,214,160,0.08)",
                border: `1px solid ${result.hasOverlap ? "rgba(239,68,68,0.25)" : "rgba(6,214,160,0.25)"}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 28 }}>
                {result.hasOverlap ? "⚠️" : "✅"}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: result.hasOverlap ? "#f87171" : "var(--cyan)",
                  }}
                >
                  {result.hasOverlap
                    ? `${result.overlaps.length} Overlap${result.overlaps.length > 1 ? "s" : ""} Detected`
                    : "No Overlaps — Clean Design"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {result.subnets.length} subnets analyzed
                </div>
              </div>
            </div>

            {/* Subnet details */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
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
                  Subnet Details
                </span>
              </div>
              {result.subnets.map((s, i) => {
                const isInOverlap = result.overlaps.some(
                  (o) => o.ai === i || o.bi === i,
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 20px",
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isInOverlap
                        ? "rgba(239,68,68,0.04)"
                        : "transparent",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span
                        className={`badge ${isInOverlap ? "badge-pink" : "badge-cyan"}`}
                      >
                        /{s.prefix}
                      </span>
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 13,
                          color: isInOverlap ? "#f87171" : "var(--cyan)",
                        }}
                      >
                        {s.cidr}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >
                      {intToIP(s.network)} → {intToIP(s.broadcast)}
                    </div>
                    {isInOverlap && (
                      <span className="overlap-yes">OVERLAP</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overlaps list */}
            {result.hasOverlap && (
              <div
                className="card animate-fadeInUp stagger-3"
                style={{ padding: 24 }}
              >
                <div
                  style={{
                    marginBottom: 14,
                    fontFamily: "Syne, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#f87171",
                  }}
                >
                  Conflicting Pairs
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {result.overlaps.map((o, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: "rgba(239,68,68,0.06)",
                        borderRadius: 8,
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 13,
                          color: "#f87171",
                        }}
                      >
                        {o.a}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>⟺</span>
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 13,
                          color: "#f87171",
                        }}
                      >
                        {o.b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <Link
            to="/ip-class"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            IP Class →
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
