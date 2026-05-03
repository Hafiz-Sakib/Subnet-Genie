import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";
import "./App.css";

function isValidCIDR(cidr) {
  const parts = cidr.trim().split("/");
  if (parts.length !== 2) return false;
  const ip = parts[0];
  const prefix = parseInt(parts[1]);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split(".").every(o => +o >= 0 && +o <= 255);
}

function ipToInt(ip) {
  const o = ip.split(".").map(Number);
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

function intToIP(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function parseCIDR(cidr) {
  const [ip, pfx] = cidr.trim().split("/");
  const prefix = parseInt(pfx);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipToInt(ip) & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { cidr: cidr.trim(), ip, prefix, network, broadcast, mask };
}

function summarizeNetworks(networks) {
  if (networks.length === 0) return null;
  if (networks.length === 1) {
    const n = networks[0];
    return { supernet: n.cidr, prefix: n.prefix, network: intToIP(n.network), broadcast: intToIP(n.broadcast), networks };
  }

  let minNetwork = networks[0].network;
  let maxBroadcast = networks[0].broadcast;
  networks.forEach(n => {
    if (n.network < minNetwork) minNetwork = n.network;
    if (n.broadcast > maxBroadcast) maxBroadcast = n.broadcast;
  });

  // Find the common prefix
  const xor = minNetwork ^ maxBroadcast;
  let prefixLen = 32;
  for (let i = 31; i >= 0; i--) {
    if ((xor >>> i) & 1) {
      prefixLen = 31 - i;
      break;
    }
  }
  if (xor === 0) prefixLen = networks[0].prefix;

  const supermask = prefixLen === 0 ? 0 : (0xffffffff << (32 - prefixLen)) >>> 0;
  const superNetwork = (minNetwork & supermask) >>> 0;
  const superBroadcast = (superNetwork | (~supermask >>> 0)) >>> 0;

  return {
    supernet: `${intToIP(superNetwork)}/${prefixLen}`,
    prefix: prefixLen,
    network: intToIP(superNetwork),
    broadcast: intToIP(superBroadcast),
    totalAddresses: Math.pow(2, 32 - prefixLen),
    networks,
    efficiency: ((networks.reduce((a, n) => a + Math.pow(2, 32 - n.prefix), 0) / Math.pow(2, 32 - prefixLen)) * 100).toFixed(1),
  };
}

function Toast({ msg, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{msg}</div>;
}

export default function NetworkSummary() {
  const [inputs, setInputs] = useState(["", "", ""]);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [toast, setToast] = useState("");

  const update = (i, val) => {
    const updated = [...inputs];
    updated[i] = val;
    setInputs(updated);
    setResult(null);
  };

  const addRow = () => { if (inputs.length < 20) setInputs([...inputs, ""]); };
  const removeRow = (i) => { if (inputs.length > 2) setInputs(inputs.filter((_, idx) => idx !== i)); setResult(null); };

  const calculate = () => {
    const errs = inputs.map((v, i) => {
      if (!v.trim()) return `Row ${i + 1}: Empty`;
      if (!isValidCIDR(v)) return `Row ${i + 1}: Invalid CIDR`;
      return null;
    });
    const valid = errs.filter(Boolean);
    setErrors(valid);
    if (valid.length > 0) return;

    const parsed = inputs.map(v => parseCIDR(v));
    setResult(summarizeNetworks(parsed));
  };

  const copy = (t) => navigator.clipboard.writeText(t).then(() => setToast("Copied!"));

  const examples = [
    ["192.168.1.0/26", "192.168.1.64/26", "192.168.1.128/26", "192.168.1.192/26"],
    ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"],
    ["172.16.0.0/24", "172.16.1.0/24"],
  ];

  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      <div className="bg-grid" />
      <div className="bg-glow-orb" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(116,185,255,0.08) 0%, transparent 70%)", top: -100, right: -100 }} />
      <NavBar />
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 60px" }}>
        <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
          <div className="section-tag">Route Aggregation</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Network Summary Tool</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Summarize multiple IP networks into a single supernet (route aggregation / supernetting).
          </p>
        </div>

        {/* Examples */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {examples.map((ex, i) => (
            <button key={i} className="chip" style={{ cursor: "pointer" }}
              onClick={() => { setInputs([...ex]); setResult(null); setErrors([]); }}>
              Example {i + 1} ({ex.length} nets)
            </button>
          ))}
        </div>

        <div className="card animate-fadeInUp stagger-1" style={{ padding: 32, marginBottom: 20 }}>
          <label className="field-label" style={{ marginBottom: 14 }}>IP Networks (CIDR notation)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {inputs.map((val, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(116,185,255,0.1)", border: "1px solid rgba(116,185,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#74b9ff", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <input className="input-field" value={val}
                  onChange={e => update(i, e.target.value)}
                  placeholder={`192.168.${i}.0/24`} style={{ flex: 1 }}
                  onKeyDown={e => e.key === "Enter" && calculate()} />
                {inputs.length > 2 && (
                  <button onClick={() => removeRow(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" onClick={calculate} style={{ flex: 1, background: "#74b9ff", color: "#0a0c10" }}>Summarize</button>
            <button className="btn-secondary" onClick={addRow} disabled={inputs.length >= 20}>+ Add Network</button>
            <button className="btn-secondary" onClick={() => { setInputs(["", "", ""]); setResult(null); setErrors([]); }}>Reset</button>
          </div>
        </div>

        {result && (
          <>
            {/* Supernet summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Supernet", value: result.supernet },
                { label: "Prefix Length", value: `/${result.prefix}` },
                { label: "Total Addresses", value: result.totalAddresses?.toLocaleString() || "—" },
                { label: "Efficiency", value: `${result.efficiency || 100}%` },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ fontSize: s.label === "Supernet" ? 16 : 20, color: "#74b9ff" }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card animate-fadeInUp stagger-1" style={{ overflow: "hidden", marginBottom: 16 }}>
              {[
                { label: "Supernet CIDR", value: result.supernet, color: "#74b9ff" },
                { label: "Network Address", value: result.network },
                { label: "Broadcast Address", value: result.broadcast, color: "#fd79a8" },
                { label: "Networks Summarized", value: result.networks.length },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: color || "var(--text-secondary)" }}>{value}</span>
                    <button className="copy-btn" onClick={() => copy(String(value))}>⎘</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input networks breakdown */}
            <div className="card animate-fadeInUp stagger-2" style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Input Networks</span>
              </div>
              <table className="result-table">
                <thead>
                  <tr><th>#</th><th>Network</th><th>Network Address</th><th>Broadcast</th><th>Hosts</th></tr>
                </thead>
                <tbody>
                  {result.networks.map((n, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-blue">{i + 1}</span></td>
                      <td><span style={{ fontFamily: "DM Mono, monospace", fontSize: 13, color: "#74b9ff" }}>{n.cidr}</span></td>
                      <td><span style={{ fontFamily: "DM Mono, monospace", fontSize: 12 }}>{intToIP(n.network)}</span></td>
                      <td><span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#fd79a8" }}>{intToIP(n.broadcast)}</span></td>
                      <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{(Math.pow(2, 32 - n.prefix) - 2).toLocaleString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link to="/" className="btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>← Home</Link>
          <Link to="/vlsm-subnet" className="btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>VLSM →</Link>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by <a href="https://github.com/hafiz-sakib" target="_blank" rel="noopener noreferrer">Mohammad Hafizur Rahman Sakib</a>
      </footer>
    </div>
  );
}
