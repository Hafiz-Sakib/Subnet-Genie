import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const isValidIP = (ip) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
  ip.split(".").every((o) => +o >= 0 && +o <= 255);

const VLSMForm = () => {
  const [baseIP, setBaseIP] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState("");
  const [hostRequirements, setHostRequirements] = useState([]);
  const [ipValid, setIpValid] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vlsm_history") || "[]");
    setHistory(stored);
  }, []);

  useEffect(() => {
    if (baseIP.length > 6) setIpValid(isValidIP(baseIP));
    else setIpValid(null);
  }, [baseIP]);

  const handleNumSubnetsChange = (val) => {
    const n = parseInt(val) || 0;
    setNumSubnets(val);
    if (n > 0 && n <= 32) {
      setHostRequirements((prev) => {
        const arr = [...prev];
        while (arr.length < n) arr.push("");
        return arr.slice(0, n);
      });
    }
  };

  const handleHostRequirementsChange = (e, index) => {
    const updated = [...hostRequirements];
    updated[index] = e.target.value;
    setHostRequirements(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!isValidIP(baseIP)) { setError("Invalid IP address format."); return; }
    const maskInt = parseInt(originalMask);
    if (maskInt < 0 || maskInt > 32) { setError("Subnet mask must be between 0 and 32."); return; }
    const hostsArr = hostRequirements.map(Number);
    if (hostsArr.some((h) => isNaN(h) || h < 1)) { setError("All host requirements must be positive numbers."); return; }

    const formData = { baseIP, originalMask, hostRequirements: hostsArr };

    const entry = {
      ip: baseIP,
      mask: originalMask,
      subnets: numSubnets,
      hosts: hostsArr.join(", "),
      time: new Date().toLocaleTimeString(),
    };
    const newHistory = [entry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("vlsm_history", JSON.stringify(newHistory));

    navigate("/vlsm-page", { state: formData });
  };

  const loadHistory = (entry) => {
    setBaseIP(entry.ip);
    setOriginalMask(entry.mask);
    setNumSubnets(entry.subnets);
    const hosts = entry.hosts.split(", ");
    setHostRequirements(hosts);
  };

  const numSubnetsInt = parseInt(numSubnets) || 0;

  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: "min(500px, 80vw)",
          height: "min(500px, 80vw)",
          background: "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)",
          top: -100,
          left: -100,
        }}
      />

      <NavBar />

      <div className="page-content">
        <div className="page-content-inner page-content-inner--narrow">
          <div className="animate-fadeInUp" style={{ marginBottom: 36 }}>
            <div className="section-tag">Variable Length Subnet Masking</div>
            <h1 style={{ fontSize: "clamp(26px, 6vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              VLSM Calculator
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Allocate subnets based on individual host requirements for efficient address space use.
            </p>
          </div>

          <div className={history.length > 0 ? "form-grid has-history" : "form-grid"}>
            {/* Form */}
            <div className="card animate-fadeInUp stagger-1" style={{ padding: "clamp(20px, 5vw, 32px)" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {/* IP */}
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
                    value={baseIP}
                    onChange={(e) => setBaseIP(e.target.value)}
                    placeholder="10.0.0.0"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>

                {/* Mask */}
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
                      placeholder="16"
                      min="0"
                      max="32"
                      required
                    />
                  </div>
                </div>

                {/* Num subnets */}
                <div>
                  <label className="field-label">Number of Subnets</label>
                  <input
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    value={numSubnets}
                    onChange={(e) => handleNumSubnetsChange(e.target.value)}
                    placeholder="3"
                    min="1"
                    max="32"
                    required
                  />
                </div>

                {/* Host requirements */}
                {numSubnetsInt > 0 && (
                  <div>
                    <label className="field-label" style={{ marginBottom: 12 }}>
                      Required Hosts per Subnet
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Array.from({ length: numSubnetsInt }, (_, index) => {
                        const h = parseInt(hostRequirements[index]) || 0;
                        const neededMask = h > 0 ? 32 - Math.ceil(Math.log2(h + 2)) : null;
                        return (
                          <div key={index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: "rgba(250,189,47,0.1)",
                                border: "1px solid rgba(250,189,47,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontFamily: "Syne, sans-serif",
                                fontWeight: 700,
                                color: "var(--gold)",
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </div>
                            <input
                              className="input-field"
                              type="number"
                              inputMode="numeric"
                              value={hostRequirements[index] || ""}
                              onChange={(e) => handleHostRequirementsChange(e, index)}
                              placeholder={`Subnet ${index + 1} hosts`}
                              min="1"
                              required
                              style={{ flex: 1 }}
                            />
                            {neededMask && <span className="chip">/{neededMask}</span>}
                          </div>
                        );
                      })}
                    </div>
                    {numSubnetsInt > 0 && hostRequirements.some((h) => parseInt(h) > 0) && (
                      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                        Total hosts needed:{" "}
                        {hostRequirements.reduce((a, h) => a + (parseInt(h) || 0), 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="error-msg">{error}</div>}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: "var(--cyan)", color: "#0a0f1a" }}
                  >
                    Calculate VLSM
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setBaseIP("");
                      setOriginalMask("");
                      setNumSubnets("");
                      setHostRequirements([]);
                      setError("");
                      setIpValid(null);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* History */}
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
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "DM Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.ip}/{h.mask}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{h.subnets} subnets</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.hosts}</div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{h.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="card animate-fadeInUp stagger-3" style={{ padding: "16px 20px", marginTop: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--cyan)", marginRight: 6 }}>ℹ</span>
              VLSM allocates the largest subnet first, then progressively smaller ones — maximizing address space efficiency.
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
};

export default VLSMForm;
