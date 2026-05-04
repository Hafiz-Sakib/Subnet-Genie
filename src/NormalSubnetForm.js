import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const ipToInt = (ip) => {
  const octets = ip.split(".").map(Number);
  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
};

const cidrToMask = (cidr) => (cidr === 0 ? 0 : ~((1 << (32 - cidr)) - 1));
const alignIPToNetwork = (ip, mask) => ip & cidrToMask(mask);

const intToIP = (ip) =>
  [(ip >> 24) & 0xff, (ip >> 16) & 0xff, (ip >> 8) & 0xff, ip & 0xff].join(".");

const calculateSubnets = (baseIP, originalMask, newMask, numSubnets) => {
  const subnetSize = 1 << (32 - newMask);
  const alignedBaseIP = alignIPToNetwork(baseIP, originalMask);
  const subnets = [];
  for (let i = 0; i < numSubnets; i++) {
    const networkAddress = alignedBaseIP + i * subnetSize;
    const broadcastAddress = networkAddress + subnetSize - 1;
    const firstHost = networkAddress + 1;
    const lastHost = broadcastAddress - 1;
    subnets.push({
      subnet: i + 1,
      networkAddress: intToIP(networkAddress),
      subnetMask: intToIP(cidrToMask(newMask)),
      broadcastAddress: intToIP(broadcastAddress),
      firstHost: intToIP(firstHost),
      lastHost: intToIP(lastHost),
      cidr: newMask,
      usableHosts: subnetSize - 2,
    });
  }
  return subnets;
};

const isValidIP = (ip) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
  ip.split(".").every((o) => +o >= 0 && +o <= 255);

function NormalSubnetForm() {
  const [ip, setIp] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState("");
  const [ipValid, setIpValid] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("flsm_history") || "[]");
    setHistory(stored);
  }, []);

  useEffect(() => {
    if (ip.length > 6) setIpValid(isValidIP(ip));
    else setIpValid(null);
  }, [ip]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!isValidIP(ip)) { setError("Invalid IP address format."); return; }
    const baseIp = ipToInt(ip);
    const originalMaskInt = parseInt(originalMask);
    const numSubnetsInt = parseInt(numSubnets);
    if (originalMaskInt < 0 || originalMaskInt > 32) { setError("Subnet mask must be between 0 and 32."); return; }
    if (numSubnetsInt < 1 || numSubnetsInt > 1024) { setError("Number of subnets must be between 1 and 1024."); return; }
    const additionalBits = Math.ceil(Math.log2(numSubnetsInt));
    const newMask = originalMaskInt + additionalBits;
    if (newMask > 32) { setError("Not enough address space for the requested number of subnets."); return; }
    const subnets = calculateSubnets(baseIp, originalMaskInt, newMask, numSubnetsInt);
    sessionStorage.setItem("subnets", JSON.stringify(subnets));

    const entry = { ip, mask: originalMask, subnets: numSubnets, time: new Date().toLocaleTimeString(), type: "FLSM" };
    const newHistory = [entry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("flsm_history", JSON.stringify(newHistory));

    navigate("/normal-subnet-results");
  };

  const loadHistory = (entry) => {
    setIp(entry.ip);
    setOriginalMask(entry.mask);
    setNumSubnets(entry.subnets);
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          background: "radial-gradient(circle, rgba(250,189,47,0.1) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />

      <NavBar />

      <div className="page-content">
        <div className="page-content-inner page-content-inner--narrow">
          <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
            <div className="section-tag">Fixed Length Subnet Masking</div>
            <h1 style={{ fontSize: "clamp(26px, 6vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              FLSM Calculator
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Divide a network into equal-sized subnets with uniform prefix length.
            </p>
          </div>

          <div className={history.length > 0 ? "form-grid has-history" : "form-grid"}>
            {/* Form */}
            <div className="card animate-fadeInUp stagger-1" style={{ padding: "clamp(20px, 5vw, 32px)" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {/* IP Field */}
                <div>
                  <label className="field-label">
                    Base IP Address
                    {ipValid === true && <span className="valid-indicator valid" />}
                    {ipValid === false && <span className="valid-indicator invalid" />}
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    inputMode="decimal"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.0"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>

                {/* Mask Field */}
                <div>
                  <label className="field-label">Original Subnet Mask (CIDR)</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 18, paddingBottom: 2, flexShrink: 0 }}>/</span>
                    <input
                      className="input-field"
                      type="number"
                      inputMode="numeric"
                      value={originalMask}
                      onChange={(e) => setOriginalMask(e.target.value)}
                      placeholder="24"
                      min="0"
                      max="32"
                      required
                    />
                  </div>
                </div>

                {/* Num Subnets */}
                <div>
                  <label className="field-label">Number of Subnets</label>
                  <input
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    value={numSubnets}
                    onChange={(e) => setNumSubnets(e.target.value)}
                    placeholder="4"
                    min="1"
                    required
                  />
                  {numSubnets && originalMask && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                      → New mask: /{parseInt(originalMask) + Math.ceil(Math.log2(parseInt(numSubnets) || 1))}
                      &nbsp;·&nbsp; Hosts/subnet:{" "}
                      {Math.pow(2, 32 - (parseInt(originalMask) + Math.ceil(Math.log2(parseInt(numSubnets) || 1)))) - 2}
                    </div>
                  )}
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Calculate Subnets</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setIp(""); setOriginalMask(""); setNumSubnets(""); setError(""); setIpValid(null); }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* History Panel */}
            {history.length > 0 && (
              <div className="animate-fadeInUp stagger-2">
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Recent
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((h, i) => (
                    <div key={i} className="history-item" onClick={() => loadHistory(h)}>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "DM Mono, monospace" }}>
                          {h.ip}/{h.mask}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{h.subnets} subnets</div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{h.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div
            className="card animate-fadeInUp stagger-3"
            style={{ padding: "16px 20px", marginTop: 20 }}
          >
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--gold)", marginRight: 6 }}>ℹ</span>
              FLSM divides a network into 2ⁿ equal subnets where n = additional bits needed.
            </div>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by{" "}
        <a href="https://github.com/hafiz-sakib" target="_blank" rel="noopener noreferrer">
          Mohammad Hafizur Rahman Sakib
        </a>
      </footer>
    </div>
  );
}

export default NormalSubnetForm;
