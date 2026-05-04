import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./App.css";

const VLSMPage = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      setShowModal(true);
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    const { baseIP, originalMask, hostRequirements } = location.state;

    const intToIP = (ip) =>
      ((ip >> 24) & 0xff) + "." + ((ip >> 16) & 0xff) + "." + ((ip >> 8) & 0xff) + "." + (ip & 0xff);

    const alignToNetwork = (ip, mask) => ip & (0xffffffff << (32 - mask));

    const calculateVLSM = (baseIP, originalMask, hostRequirements) => {
      const results = [];
      const subnets = hostRequirements.map((hosts) => ({
        requiredHosts: hosts, allocatedMask: 0, networkAddress: 0,
      }));
      subnets.sort((a, b) => b.requiredHosts - a.requiredHosts);
      let currentIP = baseIP;
      subnets.forEach((subnet) => {
        const neededBits = Math.ceil(Math.log2(subnet.requiredHosts + 2));
        subnet.allocatedMask = 32 - neededBits;
        if (subnet.allocatedMask < originalMask) {
          throw new Error(`Not enough address space for ${subnet.requiredHosts} hosts!`);
        }
        subnet.networkAddress = currentIP;
        const subnetSize = 1 << (32 - subnet.allocatedMask);
        currentIP += subnetSize;
        const networkAddress = subnet.networkAddress;
        const broadcastAddress = networkAddress + subnetSize - 1;
        const firstHost = networkAddress + 1;
        const lastHost = broadcastAddress - 1;
        const subnetMaskDecimal = intToIP((0xffffffff << (32 - subnet.allocatedMask)) >>> 0);
        const wildcardMask = intToIP(~((0xffffffff << (32 - subnet.allocatedMask)) >>> 0));
        results.push({
          requiredHosts: subnet.requiredHosts,
          subnetMaskCIDR: `${subnet.allocatedMask}`,
          subnetMaskDecimal,
          wildcardMask,
          networkAddress: intToIP(networkAddress),
          broadcastAddress: intToIP(broadcastAddress),
          usableRange: `${intToIP(firstHost)} ↔️ ${intToIP(lastHost)}`,
        });
      });
      return results;
    };

    try {
      const octets = baseIP.split(".").map((o) => parseInt(o));
      let baseIPInt = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
      baseIPInt = alignToNetwork(baseIPInt, originalMask);
      const results = calculateVLSM(baseIPInt, originalMask, hostRequirements);
      navigate("/vlsm-results", { state: { results } });
    } catch (error) {
      alert(error.message);
      navigate("/vlsm-subnet");
    }
  }, [location.state, navigate]);

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-deep)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-grid" />

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
          <div className="card" style={{ padding: 40, maxWidth: 360, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#f87171' }}>No Input Data</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>No calculation data was found. Redirecting to home...</p>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Go Home</Link>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 48, height: 48, border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>Calculating VLSM allocation...</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VLSMPage;
