import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
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

function intToIP(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function cidrToMask(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function maskToDecimal(mask) {
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff,
  ].join(".");
}

function wildcardMask(mask) {
  return maskToDecimal(~mask >>> 0);
}

function Toast({ msg, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function CIDRRange() {
  const [ip, setIp] = useState("");
  const [prefix, setPrefix] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const copy = (text) =>
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));

  const calculate = () => {
    setError("");
    setResult(null);
    if (!isValidIP(ip)) {
      setError("Invalid IP address.");
      return;
    }
    const pfx = parseInt(prefix);
    if (isNaN(pfx) || pfx < 0 || pfx > 32) {
      setError("Prefix length must be 0–32.");
      return;
    }

    const mask = cidrToMask(pfx);
    const ipInt = ipToInt(ip);
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const firstHost = pfx < 31 ? network + 1 : network;
    const lastHost = pfx < 31 ? broadcast - 1 : broadcast;
    const totalHosts = Math.pow(2, 32 - pfx);
    const usableHosts = pfx <= 30 ? totalHosts - 2 : pfx === 31 ? 2 : 1;

    setResult({
      input: `${ip}/${pfx}`,
      network: intToIP(network),
      networkCIDR: `${intToIP(network)}/${pfx}`,
      broadcast: intToIP(broadcast),
      firstHost: intToIP(firstHost),
      lastHost: intToIP(lastHost),
      subnetMask: maskToDecimal(mask),
      wildcard: wildcardMask(mask),
      totalAddresses: totalHosts,
      usableHosts,
      prefix: pfx,
      networkInt: network,
      broadcastInt: broadcast,
    });
  };

  const examples = [
    "192.168.1.0/24",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "10.10.1.0/28",
    "203.0.113.0/29",
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
            "radial-gradient(circle, rgba(253,121,168,0.08) 0%, transparent 70%)",
          top: -100,
          right: -50,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">CIDR Range Expander</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            CIDR Range
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Expand any CIDR block into network address, host range, broadcast,
            masks, and more.
          </p>
        </div>

        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 32, marginBottom: 20 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 2, minWidth: 180 }}>
              <label className="field-label">IP Address</label>
              <input
                className="input-field"
                value={ip}
                onChange={(e) => {
                  setIp(e.target.value);
                  setResult(null);
                }}
                placeholder="192.168.1.0"
                onKeyDown={(e) => e.key === "Enter" && calculate()}
              />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label className="field-label">Prefix (/)</label>
              <input
                className="input-field"
                type="number"
                value={prefix}
                onChange={(e) => {
                  setPrefix(e.target.value);
                  setResult(null);
                }}
                placeholder="24"
                min="0"
                max="32"
              />
            </div>
            <div style={{ paddingTop: 27 }}>
              <button className="btn-primary" onClick={calculate}>
                Expand
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {examples.map((eg) => (
              <button
                key={eg}
                className="chip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const [eip, epfx] = eg.split("/");
                  setIp(eip);
                  setPrefix(epfx);
                  setResult(null);
                }}
              >
                {eg}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <>
            {/* Stats */}
            <div
              className="animate-fadeInUp stagger-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: "Total Addresses",
                  value: result.totalAddresses.toLocaleString(),
                },
                {
                  label: "Usable Hosts",
                  value: result.usableHosts.toLocaleString(),
                },
                { label: "Prefix Length", value: `/${result.prefix}` },
                {
                  label: "Network Class",
                  value: (() => {
                    const f = parseInt(result.network.split(".")[0]);
                    return f < 128
                      ? "A"
                      : f < 192
                        ? "B"
                        : f < 224
                          ? "C"
                          : "D/E";
                  })(),
                },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ fontSize: 20 }}>
                    {s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              {[
                {
                  label: "Network Address",
                  value: result.networkCIDR,
                  color: "var(--cyan)",
                },
                { label: "Subnet Mask", value: result.subnetMask },
                { label: "Wildcard Mask", value: result.wildcard },
                {
                  label: "Broadcast Address",
                  value: result.broadcast,
                  color: "#fd79a8",
                },
                {
                  label: "First Usable Host",
                  value: result.firstHost,
                  color: "var(--gold)",
                },
                {
                  label: "Last Usable Host",
                  value: result.lastHost,
                  color: "var(--gold)",
                },
                {
                  label: "Host Range",
                  value: `${result.firstHost} ↔ ${result.lastHost}`,
                },
                {
                  label: "Network (Integer)",
                  value: result.networkInt.toLocaleString(),
                },
                {
                  label: "Broadcast (Integer)",
                  value: result.broadcastInt.toLocaleString(),
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 13,
                        color: color || "var(--text-secondary)",
                      }}
                    >
                      {value}
                    </span>
                    <button className="copy-btn" onClick={() => copy(value)}>
                      ⎘
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            <div
              className="card animate-fadeInUp stagger-3"
              style={{ padding: 24, marginBottom: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
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
                  Address Space Breakdown
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 28,
                  borderRadius: 6,
                  overflow: "hidden",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  Network
                </div>
                <div
                  style={{
                    flex: Math.max(result.usableHosts, 1),
                    background:
                      "linear-gradient(90deg, rgba(250,189,47,0.4), rgba(250,189,47,0.2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "var(--gold)",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  {result.usableHosts} hosts
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(253,121,168,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fd79a8",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  Broadcast
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                <span>{result.network}</span>
                <span>{result.firstHost}</span>
                <span>{result.lastHost}</span>
                <span>{result.broadcast}</span>
              </div>
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
          <Link
            to="/wildcard-mask"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Wildcard Tool →
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
