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

const CLASS_DATA = {
  A: {
    range: "1–126",
    fullRange: "1.0.0.0 – 126.255.255.255",
    defaultMask: "255.0.0.0",
    cidr: "/8",
    bits: "0xxxxxxx",
    netBits: 8,
    hostBits: 24,
    networks: 128,
    hosts: 16777214,
    color: "#fabd2f",
    badge: "badge-gold",
    desc: "Class A networks are designed for very large organizations, supporting up to 16 million hosts per network. The first octet identifies the network.",
  },
  B: {
    range: "128–191",
    fullRange: "128.0.0.0 – 191.255.255.255",
    defaultMask: "255.255.0.0",
    cidr: "/16",
    bits: "10xxxxxx",
    netBits: 16,
    hostBits: 16,
    networks: 16384,
    hosts: 65534,
    color: "#06d6a0",
    badge: "badge-cyan",
    desc: "Class B networks are used by medium-to-large organizations. The first two octets identify the network, supporting over 65,000 hosts.",
  },
  C: {
    range: "192–223",
    fullRange: "192.0.0.0 – 223.255.255.255",
    defaultMask: "255.255.255.0",
    cidr: "/24",
    bits: "110xxxxx",
    netBits: 24,
    hostBits: 8,
    networks: 2097152,
    hosts: 254,
    color: "#74b9ff",
    badge: "badge-blue",
    desc: "Class C is the most common for small networks, supporting up to 254 hosts. Three octets identify the network.",
  },
  D: {
    range: "224–239",
    fullRange: "224.0.0.0 – 239.255.255.255",
    defaultMask: "N/A",
    cidr: "N/A",
    bits: "1110xxxx",
    netBits: "N/A",
    hostBits: "N/A",
    networks: "N/A",
    hosts: "Multicast group",
    color: "#a29bfe",
    badge: "badge-purple",
    desc: "Class D addresses are reserved for multicast groups. They are not assigned to individual hosts but used for one-to-many communication.",
  },
  E: {
    range: "240–255",
    fullRange: "240.0.0.0 – 255.255.255.255",
    defaultMask: "N/A",
    cidr: "N/A",
    bits: "1111xxxx",
    netBits: "N/A",
    hostBits: "N/A",
    networks: "N/A",
    hosts: "Experimental/Reserved",
    color: "#fd79a8",
    badge: "badge-pink",
    desc: "Class E addresses are reserved for experimental and future use. They are not used in public internet routing.",
  },
};

function getClass(ip) {
  const f = parseInt(ip.split(".")[0]);
  if (f >= 1 && f <= 126) return "A";
  if (f === 127) return "Loopback";
  if (f >= 128 && f <= 191) return "B";
  if (f >= 192 && f <= 223) return "C";
  if (f >= 224 && f <= 239) return "D";
  if (f >= 240) return "E";
  return "A";
}

export default function IPClass() {
  const [ip, setIp] = useState("");
  const [ipValid, setIpValid] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (val) => {
    setIp(val);
    if (val.length > 6) setIpValid(isValidIP(val));
    else setIpValid(null);
    setResult(null);
  };

  const identify = () => {
    if (!isValidIP(ip)) return;
    const cls = getClass(ip);
    setResult({ ip, cls, data: CLASS_DATA[cls] || null });
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
            "radial-gradient(circle, rgba(250,189,47,0.09) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />
      <NavBar />

      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">IP Class Identifier</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            IP Class
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Identify the classful network class (A/B/C/D/E) of any IP address
            with full details.
          </p>
        </div>

        <div
          className="card animate-fadeInUp stagger-1"
          style={{ padding: 32, marginBottom: 24 }}
        >
          <label className="field-label">
            IPv4 Address
            {ipValid === true && <span className="valid-indicator valid" />}
            {ipValid === false && <span className="valid-indicator invalid" />}
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              className="input-field"
              value={ip}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="10.0.0.1"
              onKeyDown={(e) => e.key === "Enter" && identify()}
            />
            <button
              className="btn-primary"
              onClick={identify}
              disabled={!ipValid}
            >
              Identify
            </button>
          </div>
          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            {[
              "10.0.0.1",
              "172.16.1.1",
              "192.168.0.1",
              "224.0.0.5",
              "240.0.0.1",
            ].map((eg) => (
              <button
                key={eg}
                className="chip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleChange(eg);
                  setResult(null);
                }}
              >
                {eg}
              </button>
            ))}
          </div>
        </div>

        {result && result.cls === "Loopback" && (
          <div
            className="card animate-fadeInUp stagger-1"
            style={{
              padding: 24,
              marginBottom: 20,
              borderColor: "rgba(253,150,68,0.25)",
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 36 }}>🔄</span>
              <div>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--orange)",
                  }}
                >
                  Loopback Address
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginTop: 6,
                  }}
                >
                  127.0.0.0/8 — Reserved for loopback. Traffic sent to this
                  range never leaves the host and is used for local testing.
                  127.0.0.1 ("localhost") is the canonical loopback address.
                </div>
              </div>
            </div>
          </div>
        )}

        {result && result.data && (
          <>
            <div
              className="card animate-fadeInUp stagger-1"
              style={{
                padding: 32,
                marginBottom: 20,
                borderColor: `${result.data.color}30`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: `${result.data.color}18`,
                    border: `2px solid ${result.data.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 32,
                      fontWeight: 800,
                      color: result.data.color,
                    }}
                  >
                    {result.cls}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    className={`badge ${result.data.badge}`}
                    style={{ marginBottom: 8 }}
                  >
                    Class {result.cls}
                  </span>
                  <h2
                    style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}
                  >
                    {result.ip}
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {result.data.desc}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="card animate-fadeInUp stagger-2"
              style={{ overflow: "hidden", marginBottom: 20 }}
            >
              {[
                { label: "Class", value: `Class ${result.cls}` },
                { label: "First Octet Range", value: result.data.range },
                { label: "Full Range", value: result.data.fullRange },
                {
                  label: "Default Mask",
                  value: `${result.data.defaultMask} (${result.data.cidr})`,
                },
                { label: "Leading Bits", value: result.data.bits, mono: true },
                { label: "Network Bits", value: String(result.data.netBits) },
                { label: "Host Bits", value: String(result.data.hostBits) },
                {
                  label: "Possible Networks",
                  value:
                    typeof result.data.networks === "number"
                      ? result.data.networks.toLocaleString()
                      : result.data.networks,
                },
                {
                  label: "Max Hosts/Network",
                  value:
                    typeof result.data.hosts === "number"
                      ? result.data.hosts.toLocaleString()
                      : result.data.hosts,
                },
              ].map(({ label, value }) => (
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
                  <span
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* All classes reference */}
        <div style={{ marginTop: 32 }}>
          <div className="section-tag" style={{ marginBottom: 16 }}>
            Class Reference
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {Object.entries(CLASS_DATA).map(([cls, d]) => (
              <div
                key={cls}
                className="card"
                style={{
                  padding: 18,
                  borderColor: `${d.color}25`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  const eg =
                    cls === "A"
                      ? "10.0.0.1"
                      : cls === "B"
                        ? "172.16.1.1"
                        : cls === "C"
                          ? "192.168.1.1"
                          : cls === "D"
                            ? "224.0.0.1"
                            : "240.0.0.1";
                  handleChange(eg);
                  setResult({ ip: eg, cls, data: d });
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: d.color,
                    }}
                  >
                    {cls}
                  </span>
                  <span className={`badge ${d.badge}`}>{d.range}</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  {d.defaultMask}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "DM Mono, monospace",
                    marginTop: 2,
                  }}
                >
                  {typeof d.hosts === "number"
                    ? d.hosts.toLocaleString() + " hosts"
                    : d.hosts}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
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
            to="/subnet-quiz"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Take Quiz →
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
