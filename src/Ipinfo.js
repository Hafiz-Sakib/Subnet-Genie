import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const isValidIP = (ip) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
  ip.split(".").every((o) => +o >= 0 && +o <= 255);

function ipToInt(ip) {
  const o = ip.split(".").map(Number);
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

function toBinary(ip) {
  return ip
    .split(".")
    .map((o) => parseInt(o).toString(2).padStart(8, "0"))
    .join(".");
}

function toHex(ip) {
  return ip
    .split(".")
    .map((o) => parseInt(o).toString(16).toUpperCase().padStart(2, "0"))
    .join(":");
}

function getIPClass(ip) {
  const first = parseInt(ip.split(".")[0]);
  if (first >= 1 && first <= 126)
    return {
      cls: "A",
      range: "1.0.0.0 – 126.255.255.255",
      defaultMask: "255.0.0.0",
      cidr: "/8",
      hosts: "16,777,214",
    };
  if (first === 127)
    return {
      cls: "Loopback",
      range: "127.0.0.0 – 127.255.255.255",
      defaultMask: "255.0.0.0",
      cidr: "/8",
      hosts: "Reserved",
    };
  if (first >= 128 && first <= 191)
    return {
      cls: "B",
      range: "128.0.0.0 – 191.255.255.255",
      defaultMask: "255.255.0.0",
      cidr: "/16",
      hosts: "65,534",
    };
  if (first >= 192 && first <= 223)
    return {
      cls: "C",
      range: "192.0.0.0 – 223.255.255.255",
      defaultMask: "255.255.255.0",
      cidr: "/24",
      hosts: "254",
    };
  if (first >= 224 && first <= 239)
    return {
      cls: "D",
      range: "224.0.0.0 – 239.255.255.255",
      defaultMask: "N/A (Multicast)",
      cidr: "N/A",
      hosts: "Multicast",
    };
  if (first >= 240)
    return {
      cls: "E",
      range: "240.0.0.0 – 255.255.255.255",
      defaultMask: "N/A (Experimental)",
      cidr: "N/A",
      hosts: "Experimental",
    };
  return {
    cls: "Unknown",
    range: "-",
    defaultMask: "-",
    cidr: "-",
    hosts: "-",
  };
}

function getIPType(ip) {
  const types = [];
  const parts = ip.split(".").map(Number);
  const [a, b] = parts;

  if (a === 10) types.push("Private (RFC 1918)");
  else if (a === 172 && b >= 16 && b <= 31) types.push("Private (RFC 1918)");
  else if (a === 192 && b === 168) types.push("Private (RFC 1918)");
  else if (a === 127) types.push("Loopback (RFC 5735)");
  else if (a === 169 && b === 254) types.push("Link-Local (APIPA)");
  else if (a >= 224 && a <= 239) types.push("Multicast (RFC 3171)");
  else if (a >= 240) types.push("Reserved / Experimental");
  else if (ip === "255.255.255.255") types.push("Broadcast");
  else types.push("Public / Routable");

  if (a === 100 && b >= 64 && b <= 127)
    types.push("Shared Address Space (RFC 6598)");
  if (a === 192 && b === 0 && parts[2] === 2)
    types.push("Documentation (RFC 5737)");
  if (a === 198 && (b === 51 || b === 18 || b === 19))
    types.push("Documentation/Benchmark");
  if (a === 203 && b === 0 && parts[2] === 113)
    types.push("Documentation (RFC 5737)");

  return types;
}

function BinaryDisplay({ ip }) {
  const octets = ip.split(".");
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {octets.map((oct, oi) => (
        <React.Fragment key={oi}>
          <div className="binary-row">
            {parseInt(oct)
              .toString(2)
              .padStart(8, "0")
              .split("")
              .map((bit, bi) => (
                <div
                  key={bi}
                  className={`binary-bit ${bit === "1" ? "one" : "zero"}`}
                >
                  {bit}
                </div>
              ))}
          </div>
          {oi < 3 && (
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>.</span>
          )}
        </React.Fragment>
      ))}
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

export default function IPInfo() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [ipValid, setIpValid] = useState(null);
  const [toast, setToast] = useState("");

  const handleChange = (val) => {
    setIp(val);
    if (val.length > 6) setIpValid(isValidIP(val));
    else setIpValid(null);
    setResult(null);
  };

  const analyze = () => {
    if (!isValidIP(ip)) return;
    const cls = getIPClass(ip);
    const types = getIPType(ip);
    setResult({
      ip,
      cls,
      types,
      binary: toBinary(ip),
      hex: toHex(ip),
      integer: ipToInt(ip),
    });
  };

  const copy = (text) =>
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));

  const classBadgeColor = {
    A: "badge-gold",
    B: "badge-cyan",
    C: "badge-blue",
    D: "badge-purple",
    E: "badge-pink",
    Loopback: "badge-orange",
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
            "radial-gradient(circle, rgba(162,155,254,0.1) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">IP Address Analyzer</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            IP Info
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Deep-dive into any IPv4 address — class, type, binary
            representation, RFC classification.
          </p>
        </div>

        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 32, marginBottom: 20 }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">
                IPv4 Address
                {ipValid === true && <span className="valid-indicator valid" />}
                {ipValid === false && (
                  <span className="valid-indicator invalid" />
                )}
              </label>
              <input
                className="input-field"
                type="text"
                value={ip}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="192.168.1.1"
                onKeyDown={(e) => e.key === "Enter" && analyze()}
              />
            </div>
            <div style={{ paddingTop: 27 }}>
              <button
                className="btn-primary"
                onClick={analyze}
                disabled={!ipValid}
              >
                Analyze
              </button>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            {[
              "10.0.0.1",
              "192.168.1.1",
              "172.16.0.1",
              "8.8.8.8",
              "127.0.0.1",
              "224.0.0.1",
            ].map((eg) => (
              <button
                key={eg}
                className="chip"
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--border-subtle)",
                }}
                onClick={() => {
                  setIp(eg);
                  setIpValid(true);
                  setResult(null);
                }}
              >
                {eg}
              </button>
            ))}
          </div>
        </div>

        {result && (
          <>
            {/* Binary */}
            <div
              className="card animate-fadeInUp stagger-1"
              style={{ padding: 24, marginBottom: 16 }}
            >
              <div style={{ marginBottom: 14 }}>
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
                  Binary Representation
                </span>
              </div>
              <BinaryDisplay ip={result.ip} />
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "DM Mono, monospace",
                }}
              >
                {result.binary}
              </div>
            </div>

            {/* Core info */}
            <div
              className="card animate-fadeInUp stagger-2"
              style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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
                  Address Details
                </span>
              </div>
              {[
                {
                  label: "IP Address",
                  value: result.ip,
                  accent: "var(--cyan)",
                },
                {
                  label: "IP Class",
                  value: result.cls.cls || result.cls,
                  badge: classBadgeColor[result.cls.cls] || "badge-gold",
                },
                { label: "Hex", value: result.hex },
                { label: "Integer", value: result.integer.toLocaleString() },
                {
                  label: "Default Mask",
                  value: `${result.cls.defaultMask} (${result.cls.cidr})`,
                },
                { label: "Usable Hosts", value: result.cls.hosts },
                { label: "Class Range", value: result.cls.range },
              ].map(({ label, value, accent, badge }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 20px",
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
                        color: accent || "var(--text-secondary)",
                      }}
                    >
                      {badge ? (
                        <span className={`badge ${badge}`}>{value}</span>
                      ) : (
                        value
                      )}
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

            {/* Type tags */}
            <div
              className="card animate-fadeInUp stagger-3"
              style={{ padding: 20, marginBottom: 16 }}
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
                  RFC Classification
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {result.types.map((t) => (
                  <span key={t} className="badge badge-cyan">
                    {t}
                  </span>
                ))}
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
            to="/binary-converter"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Binary Converter →
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
