import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";
import "./App.css";

function maskToInt(mask) {
  return mask.split(".").reduce((acc, o) => (acc << 8) | parseInt(o), 0) >>> 0;
}
function intToMask(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}
function isValidMask(mask) {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(mask)) return false;
  const n = maskToInt(mask);
  // Valid subnet masks have contiguous 1s
  const inv = ~n >>> 0;
  return ((inv + 1) & inv) === 0;
}
function isValidWildcard(wc) {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(wc) &&
    wc.split(".").every((o) => +o >= 0 && +o <= 255)
  );
}
function maskToCIDR(mask) {
  return maskToInt(mask).toString(2).split("1").length - 1;
}

function Toast({ msg, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function WildcardMask() {
  const [mode, setMode] = useState("mask2wild");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const copy = (t) =>
    navigator.clipboard.writeText(t).then(() => setToast("Copied!"));

  const convert = () => {
    setError("");
    setResult(null);
    if (mode === "mask2wild") {
      if (!isValidMask(input)) {
        setError(
          "Invalid subnet mask. Must be a valid contiguous mask like 255.255.255.0",
        );
        return;
      }
      const maskInt = maskToInt(input);
      const wildcardInt = ~maskInt >>> 0;
      const cidr = maskToCIDR(input);
      setResult({
        subnetMask: input,
        wildcard: intToMask(wildcardInt),
        cidr: `/${cidr}`,
        hostBits: 32 - cidr,
        totalHosts: Math.pow(2, 32 - cidr),
        usableHosts:
          cidr <= 30 ? Math.pow(2, 32 - cidr) - 2 : cidr === 31 ? 2 : 1,
      });
    } else if (mode === "wild2mask") {
      if (!isValidWildcard(input)) {
        setError("Invalid wildcard mask.");
        return;
      }
      const wcInt = maskToInt(input);
      const maskInt = ~wcInt >>> 0;
      const mask = intToMask(maskInt);
      const cidr = maskToCIDR(mask);
      setResult({
        subnetMask: mask,
        wildcard: input,
        cidr: `/${cidr}`,
        hostBits: 32 - cidr,
        totalHosts: Math.pow(2, 32 - cidr),
        usableHosts:
          cidr <= 30 ? Math.pow(2, 32 - cidr) - 2 : cidr === 31 ? 2 : 1,
      });
    } else {
      const cidr = parseInt(input);
      if (isNaN(cidr) || cidr < 0 || cidr > 32) {
        setError("CIDR prefix must be 0–32.");
        return;
      }
      const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
      const wildcardInt = ~maskInt >>> 0;
      setResult({
        subnetMask: intToMask(maskInt),
        wildcard: intToMask(wildcardInt),
        cidr: `/${cidr}`,
        hostBits: 32 - cidr,
        totalHosts: Math.pow(2, 32 - cidr),
        usableHosts:
          cidr <= 30 ? Math.pow(2, 32 - cidr) - 2 : cidr === 31 ? 2 : 1,
      });
    }
  };

  const commonMasks = [
    { cidr: 8, mask: "255.0.0.0", wild: "0.255.255.255" },
    { cidr: 16, mask: "255.255.0.0", wild: "0.0.255.255" },
    { cidr: 24, mask: "255.255.255.0", wild: "0.0.0.255" },
    { cidr: 25, mask: "255.255.255.128", wild: "0.0.0.127" },
    { cidr: 26, mask: "255.255.255.192", wild: "0.0.0.63" },
    { cidr: 27, mask: "255.255.255.224", wild: "0.0.0.31" },
    { cidr: 28, mask: "255.255.255.240", wild: "0.0.0.15" },
    { cidr: 29, mask: "255.255.255.248", wild: "0.0.0.7" },
    { cidr: 30, mask: "255.255.255.252", wild: "0.0.0.3" },
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
            "radial-gradient(circle, rgba(253,150,68,0.09) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Wildcard Mask Tool</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Wildcard Masks
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Convert between subnet masks, wildcard masks, and CIDR notation for
            ACL and routing configuration.
          </p>
        </div>

        <div
          className="tab-bar animate-fadeInUp stagger-1"
          style={{ marginBottom: 20 }}
        >
          {[
            { key: "mask2wild", label: "Mask → Wildcard" },
            { key: "wild2mask", label: "Wildcard → Mask" },
            { key: "cidr2both", label: "CIDR → Both" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`tab-btn ${mode === key ? "active" : ""}`}
              onClick={() => {
                setMode(key);
                setResult(null);
                setError("");
                setInput("");
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="card animate-fadeInUp stagger-2"
          style={{ padding: 32, marginBottom: 20 }}
        >
          <label className="field-label">
            {mode === "mask2wild"
              ? "Subnet Mask"
              : mode === "wild2mask"
                ? "Wildcard Mask"
                : "CIDR Prefix (0–32)"}
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            {mode === "cidr2both" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: 18 }}>
                  /
                </span>
                <input
                  className="input-field"
                  type="number"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setResult(null);
                  }}
                  placeholder="24"
                  min="0"
                  max="32"
                  onKeyDown={(e) => e.key === "Enter" && convert()}
                />
              </div>
            ) : (
              <input
                className="input-field"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setResult(null);
                }}
                placeholder={
                  mode === "mask2wild" ? "255.255.255.0" : "0.0.0.255"
                }
                onKeyDown={(e) => e.key === "Enter" && convert()}
              />
            )}
            <button
              className="btn-primary"
              onClick={convert}
              style={{ background: "var(--orange)", color: "#0a0c10" }}
            >
              Convert
            </button>
          </div>
          {error && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <div
            className="card animate-fadeInUp stagger-1"
            style={{ overflow: "hidden", marginBottom: 20 }}
          >
            {[
              { label: "Subnet Mask", value: result.subnetMask },
              {
                label: "Wildcard Mask",
                value: result.wildcard,
                color: "var(--orange)",
              },
              {
                label: "CIDR Notation",
                value: result.cidr,
                color: "var(--gold)",
              },
              { label: "Host Bits", value: result.hostBits },
              {
                label: "Total Addresses",
                value: result.totalHosts.toLocaleString(),
              },
              {
                label: "Usable Hosts",
                value: result.usableHosts.toLocaleString(),
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 13,
                      color: color || "var(--text-secondary)",
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

        {/* Reference table */}
        <div
          className="card animate-fadeInUp stagger-3"
          style={{ overflow: "hidden" }}
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
              Common Masks Reference
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="result-table">
              <thead>
                <tr>
                  <th>CIDR</th>
                  <th>Subnet Mask</th>
                  <th>Wildcard Mask</th>
                  <th>Hosts</th>
                </tr>
              </thead>
              <tbody>
                {commonMasks.map((m) => (
                  <tr
                    key={m.cidr}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setMode("cidr2both");
                      setInput(String(m.cidr));
                      setResult(null);
                    }}
                  >
                    <td>
                      <span className="badge badge-gold">/{m.cidr}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 13,
                        }}
                      >
                        {m.mask}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 13,
                          color: "var(--orange)",
                        }}
                      >
                        {m.wild}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 12 }}
                      >
                        {(Math.pow(2, 32 - m.cidr) - 2).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
            to="/overlap-detector"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Overlap Detector →
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
