import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./App.css";

function NavBar() {
  const location = useLocation();
  return (
    <nav className="nav-bar">
      <Link to="/" className="nav-logo">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.9"/>
          <rect x="12" y="1" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.4"/>
          <rect x="1" y="12" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.4"/>
          <rect x="12" y="12" width="9" height="9" rx="2" fill="#06d6a0" opacity="0.8"/>
        </svg>
        Sub<span>Calc</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/normal-subnet" className={`nav-link ${location.pathname === "/normal-subnet" ? "active" : ""}`}>FLSM</Link>
        <Link to="/vlsm-subnet" className="nav-link">VLSM</Link>
      </div>
    </nav>
  );
}

function getSubnetPrefixLength(subnetMask) {
  return subnetMask.split(".").map(o => parseInt(o).toString(2).padStart(8,"0")).join("").split("1").length - 1;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{msg}</div>;
}

function NormalSubnetResult() {
  const [subnets, setSubnets] = useState([]);
  const [toast, setToast] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table | visual
  const navigate = useNavigate();

  useEffect(() => {
    const result = JSON.parse(sessionStorage.getItem("subnets"));
    if (result) setSubnets(result);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => setToast("Copied!"));
  };

  const copyAll = () => {
    const text = subnets.map(s =>
      `Subnet ${s.subnet}: ${s.networkAddress}/${getSubnetPrefixLength(s.subnetMask)} | Mask: ${s.subnetMask} | Broadcast: ${s.broadcastAddress} | Range: ${s.firstHost} - ${s.lastHost} | Hosts: ${s.usableHosts}`
    ).join("\n");
    copyToClipboard(text);
    setToast("All results copied!");
  };

  const exportCSV = () => {
    const header = "Subnet,Network Address,CIDR,Subnet Mask,Broadcast,First Host,Last Host,Usable Hosts\n";
    const rows = subnets.map(s =>
      `${s.subnet},${s.networkAddress},/${getSubnetPrefixLength(s.subnetMask)},${s.subnetMask},${s.broadcastAddress},${s.firstHost},${s.lastHost},${s.usableHosts}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flsm_results.csv"; a.click();
    setToast("CSV exported!");
  };

  const totalHosts = subnets.reduce((a, s) => a + (s.usableHosts || 0), 0);

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <div className="bg-grid" />
      <div className="bg-glow-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(250,189,47,0.08) 0%, transparent 70%)', top: 0, left: '50%' }} />
      <NavBar />

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 60px' }}>
        {/* Header */}
        <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div className="section-tag">Results</div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>FLSM Results</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{subnets.length} subnet{subnets.length !== 1 ? 's' : ''} calculated</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, border: '1px solid var(--border-subtle)' }}>
              {['table', 'visual'].map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: viewMode === m ? 'var(--gold)' : 'transparent', color: viewMode === m ? '#0a0c10' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  {m}
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={copyAll} style={{ fontSize: 12 }}>Copy All</button>
            <button className="btn-secondary" onClick={exportCSV} style={{ fontSize: 12 }}>Export CSV</button>
          </div>
        </div>

        {/* Stats row */}
        {subnets.length > 0 && (
          <div className="animate-fadeInUp stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Subnets', value: subnets.length },
              { label: 'Usable Hosts Each', value: subnets[0]?.usableHosts ?? '—' },
              { label: 'Total Usable Hosts', value: totalHosts },
              { label: 'Subnet Mask CIDR', value: `/${getSubnetPrefixLength(subnets[0]?.subnetMask || '255.255.255.0')}` },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {subnets.length > 0 ? (
          <div className="animate-fadeInUp stagger-2">
            {viewMode === 'table' ? (
              <>
                {/* Desktop Table */}
                <div className="card" style={{ overflow: 'hidden' }} >
                  <div style={{ display: 'none' }} className="mobile-hide-block" />
                  <div style={{ overflowX: 'auto' }}>
                    <table className="result-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Network Address</th>
                          <th>Subnet Mask</th>
                          <th>Broadcast</th>
                          <th>First Host</th>
                          <th>Last Host</th>
                          <th>Usable</th>
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subnets.map((subnet, index) => (
                          <tr key={index}>
                            <td><span className="badge badge-gold">{subnet.subnet}</span></td>
                            <td><span className="ip-display">{subnet.networkAddress}/{getSubnetPrefixLength(subnet.subnetMask)}</span></td>
                            <td><span style={{ color: 'var(--text-secondary)' }}>{subnet.subnetMask}</span></td>
                            <td><span style={{ color: 'var(--text-secondary)' }}>{subnet.broadcastAddress}</span></td>
                            <td><span style={{ color: 'var(--cyan)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{subnet.firstHost}</span></td>
                            <td><span style={{ color: 'var(--cyan)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{subnet.lastHost}</span></td>
                            <td><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{subnet.usableHosts}</span></td>
                            <td>
                              <button className="copy-btn" onClick={() => copyToClipboard(`${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`)}>⎘</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div style={{ display: 'none' }}>
                  {subnets.map((subnet, index) => (
                    <div key={index} className="mobile-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span className="badge badge-gold">Subnet {subnet.subnet}</span>
                        <button className="copy-btn" onClick={() => copyToClipboard(`${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`)}>⎘ Copy</button>
                      </div>
                      {[
                        ['Network', `${subnet.networkAddress}/${getSubnetPrefixLength(subnet.subnetMask)}`],
                        ['Mask', subnet.subnetMask],
                        ['Broadcast', subnet.broadcastAddress],
                        ['First Host', subnet.firstHost],
                        ['Last Host', subnet.lastHost],
                        ['Usable Hosts', subnet.usableHosts],
                      ].map(([k, v]) => (
                        <div key={k} className="mobile-card-row">
                          <span className="mobile-card-key">{k}</span>
                          <span className="mobile-card-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Visual mode */
              <div className="card" style={{ padding: 28 }}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Address Space Visualization</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subnets.map((subnet, index) => {
                    const colors = ['#fabd2f','#06d6a0','#74b9ff','#fd79a8','#a29bfe','#fdcb6e','#55efc4','#fd9644'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{subnet.networkAddress}/{getSubnetPrefixLength(subnet.subnetMask)}</span>
                          </div>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{subnet.usableHosts} hosts</span>
                        </div>
                        <div className="subnet-bar">
                          <div className="subnet-bar-fill" style={{ width: `${100 / subnets.length}%`, background: `linear-gradient(90deg, ${color}99, ${color}44)` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          <span>{subnet.firstHost}</span>
                          <span>{subnet.lastHost}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            No results available.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate("/normal-subnet")}>
            ← Calculate Again
          </button>
          <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Home
          </Link>
          <Link to="/vlsm-subnet" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Try VLSM →
          </Link>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by <a href="https://github.com/hafiz-sakib" target="_blank" rel="noopener noreferrer">Mohammad Hafizur Rahman Sakib</a>
      </footer>
    </div>
  );
}

export default NormalSubnetResult;
