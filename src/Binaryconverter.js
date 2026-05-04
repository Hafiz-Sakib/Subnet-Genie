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

function isValidBinary(bin) {
  const parts = bin.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^[01]{8}$/.test(p));
}

function ipToBinary(ip) {
  return ip
    .split(".")
    .map((o) => parseInt(o).toString(2).padStart(8, "0"))
    .join(".");
}

function binaryToIP(bin) {
  return bin
    .split(".")
    .map((b) => parseInt(b, 2))
    .join(".");
}

function ipToHex(ip) {
  return (
    "0x" +
    ip
      .split(".")
      .map((o) => parseInt(o).toString(16).toUpperCase().padStart(2, "0"))
      .join("")
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

function BinaryEditor({ value, onChange }) {
  const octets = value.split(".");
  const handleBit = (oi, bi, bit) => {
    const newOctets = [...octets];
    const bits = (newOctets[oi] || "00000000").split("");
    bits[bi] = bit === "1" ? "0" : "1";
    newOctets[oi] = bits.join("").padStart(8, "0");
    while (newOctets.length < 4) newOctets.push("00000000");
    onChange(newOctets.join("."));
  };

  return (
    <div>
      {[0, 1, 2, 3].map((oi) => {
        const octet = (octets[oi] || "00000000").padStart(8, "0");
        return (
          <div key={oi} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  width: 60,
                }}
              >
                Octet {oi + 1}
              </span>
              <span
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                {parseInt(octet, 2)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {octet.split("").map((bit, bi) => (
                <button
                  key={bi}
                  onClick={() => handleBit(oi, bi, bit)}
                  className={`binary-bit ${bit === "1" ? "one" : "zero"}`}
                  style={{
                    cursor: "pointer",
                    border:
                      bit === "1"
                        ? "1px solid rgba(250,189,47,0.3)"
                        : "1px solid var(--border-subtle)",
                    transition: "all 0.15s",
                    width: 32,
                    height: 32,
                    fontSize: 13,
                  }}
                >
                  {bit}
                </button>
              ))}
              <div
                style={{ marginLeft: 8, display: "flex", alignItems: "center" }}
              >
                <span
                  style={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  2^{7 - 0}…2^0
                </span>
              </div>
            </div>
          </div>
        );
      })}
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

export default function BinaryConverter() {
  const [mode, setMode] = useState("dec2bin"); // dec2bin | bin2dec | biteditor
  const [decIP, setDecIP] = useState("");
  const [binIP, setBinIP] = useState("11000000.10101000.00000001.00000001");
  const [hexIn, setHexIn] = useState("");
  const [intIn, setIntIn] = useState("");
  const [toast, setToast] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const copy = (text) =>
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));

  const convertDecToBin = () => {
    setError("");
    if (!isValidIP(decIP)) {
      setError("Invalid IP address.");
      return;
    }
    setResult({
      decimal: decIP,
      binary: ipToBinary(decIP),
      hex: ipToHex(decIP),
      integer: ipToInt(decIP),
    });
  };

  const convertBinToDec = () => {
    setError("");
    if (!isValidBinary(binIP)) {
      setError(
        "Invalid binary format. Use 8 bits per octet separated by dots (e.g. 11000000.10101000.00000001.00000001)",
      );
      return;
    }
    const ip = binaryToIP(binIP);
    setResult({
      decimal: ip,
      binary: binIP,
      hex: ipToHex(ip),
      integer: ipToInt(ip),
    });
  };

  const convertFromBitEditor = () => {
    const ip = binaryToIP(binIP);
    setResult({
      decimal: ip,
      binary: binIP,
      hex: ipToHex(ip),
      integer: ipToInt(ip),
    });
  };

  const convertHex = () => {
    try {
      const clean = hexIn.replace(/^0x/i, "").replace(/:/g, "");
      if (clean.length !== 8) {
        setError("Hex must be 8 characters (e.g. C0A80101).");
        return;
      }
      const n = parseInt(clean, 16);
      const ip = intToIP(n);
      setResult({
        decimal: ip,
        binary: ipToBinary(ip),
        hex: ipToHex(ip),
        integer: n,
      });
    } catch {
      setError("Invalid hex value.");
    }
  };

  const convertInt = () => {
    const n = parseInt(intIn);
    if (isNaN(n) || n < 0 || n > 4294967295) {
      setError("Integer must be 0–4294967295.");
      return;
    }
    const ip = intToIP(n);
    setResult({
      decimal: ip,
      binary: ipToBinary(ip),
      hex: ipToHex(ip),
      integer: n,
    });
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
            "radial-gradient(circle, rgba(116,185,255,0.1) 0%, transparent 70%)",
          top: -100,
          left: -100,
        }}
      />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div
        style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Binary ↔ Decimal IP Converter</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Binary Converter
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Convert IP addresses between decimal, binary, hex, and integer —
            with an interactive bit editor.
          </p>
        </div>

        {/* Mode tabs */}
        <div
          className="tab-bar animate-fadeInUp stagger-1"
          style={{ marginBottom: 20 }}
        >
          {[
            { key: "dec2bin", label: "Decimal → Binary" },
            { key: "bin2dec", label: "Binary → Decimal" },
            { key: "biteditor", label: "Bit Editor" },
            { key: "hex", label: "Hex / Integer" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`tab-btn ${mode === key ? "active" : ""}`}
              onClick={() => {
                setMode(key);
                setResult(null);
                setError("");
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
          {mode === "dec2bin" && (
            <div>
              <label className="field-label">IPv4 Address (Decimal)</label>
              <div style={{ display: "flex", gap: 12 }}>
                <input
                  className="input-field"
                  value={decIP}
                  onChange={(e) => {
                    setDecIP(e.target.value);
                    setResult(null);
                  }}
                  placeholder="192.168.1.1"
                  onKeyDown={(e) => e.key === "Enter" && convertDecToBin()}
                />
                <button className="btn-primary" onClick={convertDecToBin}>
                  Convert
                </button>
              </div>
            </div>
          )}

          {mode === "bin2dec" && (
            <div>
              <label className="field-label">Binary IP (8.8.8.8 format)</label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <input
                  className="input-field"
                  value={binIP}
                  onChange={(e) => {
                    setBinIP(e.target.value);
                    setResult(null);
                  }}
                  placeholder="11000000.10101000.00000001.00000001"
                />
                <button className="btn-primary" onClick={convertBinToDec}>
                  Convert
                </button>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                }}
              >
                Format: 8 ones/zeros per octet, separated by dots
              </p>
            </div>
          )}

          {mode === "biteditor" && (
            <div>
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Click bits to toggle
                </span>
                <button
                  className="btn-primary"
                  onClick={convertFromBitEditor}
                  style={{ padding: "8px 20px", fontSize: 11 }}
                >
                  Get Result
                </button>
              </div>
              <BinaryEditor
                value={binIP}
                onChange={(v) => {
                  setBinIP(v);
                  setResult(null);
                }}
              />
            </div>
          )}

          {mode === "hex" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="field-label">
                  Hexadecimal (e.g. C0A80101 or 0xC0A80101)
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    className="input-field"
                    value={hexIn}
                    onChange={(e) => {
                      setHexIn(e.target.value);
                      setResult(null);
                    }}
                    placeholder="C0A80101"
                  />
                  <button className="btn-primary" onClick={convertHex}>
                    Convert
                  </button>
                </div>
              </div>
              <div className="divider" />
              <div>
                <label className="field-label">
                  32-bit Integer (0 – 4,294,967,295)
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    className="input-field"
                    type="number"
                    value={intIn}
                    onChange={(e) => {
                      setIntIn(e.target.value);
                      setResult(null);
                    }}
                    placeholder="3232235777"
                  />
                  <button className="btn-primary" onClick={convertInt}>
                    Convert
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <div
            className="card animate-fadeInUp stagger-1"
            style={{ padding: 0, overflow: "hidden" }}
          >
            <div
              style={{
                padding: "16px 20px",
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
                Conversion Results
              </span>
            </div>
            {[
              {
                label: "Decimal (Dotted)",
                value: result.decimal,
                color: "var(--cyan)",
              },
              { label: "Binary", value: result.binary, color: "var(--gold)" },
              { label: "Hexadecimal", value: result.hex },
              {
                label: "32-bit Integer",
                value: result.integer.toLocaleString(),
              },
            ].map(({ label, value, color }) => (
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 13,
                      color: color || "var(--text-secondary)",
                      wordBreak: "break-all",
                    }}
                  >
                    {String(value)}
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
            to="/cidr-range"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            CIDR Range Expander →
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
