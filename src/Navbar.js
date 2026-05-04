import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const links = [
    { to: "/", label: "Home" },
    { to: "/normal-subnet", label: "FLSM" },
    { to: "/vlsm-subnet", label: "VLSM" },
    { to: "/ip-info", label: "IP Info" },
    { to: "/binary-converter", label: "Binary" },
    { to: "/cidr-range", label: "CIDR" },
    { to: "/wildcard-mask", label: "Wildcard" },
    { to: "/overlap-detector", label: "Overlap" },
    { to: "/ip-class", label: "IP Class" },
    { to: "/network-summary", label: "Summary" },
    { to: "/subnet-visual-map", label: "Visual Map" },
    { to: "/ip-heatmap", label: "Heatmap" },
    { to: "/subnet-comparison", label: "Compare" },
    { to: "/subnet-quiz", label: "Quiz" },
    { to: "/blog", label: "Blog" },
  ];

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const desktopLinks = links.slice(0, 7);
  const moreLinks = links.slice(7);

  return (
    <>
      <nav className="nav-bar" ref={menuRef}>
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.9" />
            <rect x="12" y="1" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.4" />
            <rect x="1" y="12" width="9" height="9" rx="2" fill="#fabd2f" opacity="0.4" />
            <rect x="12" y="12" width="9" height="9" rx="2" fill="#06d6a0" opacity="0.8" />
          </svg>
          Sub<span>Calc</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links-desktop">
          {desktopLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`nav-link ${isActive(to) ? "active" : ""}`}>
              {label}
            </Link>
          ))}
          <div className="nav-more-wrapper">
            <button className="nav-link nav-more-btn" style={{ background: "none", border: "none", cursor: "pointer" }}>
              More ▾
            </button>
            <div className="nav-more-dropdown">
              {moreLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={`nav-more-item ${isActive(to) ? "active" : ""}`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "var(--gold)" : "var(--text-secondary)", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "var(--text-secondary)", borderRadius: 2, transition: "all 0.3s", margin: "5px 0" }} />
          <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "var(--gold)" : "var(--text-secondary)", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
        </button>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 98 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(300px, 85vw)",
        background: "var(--bg-card)", borderLeft: "1px solid var(--border-subtle)",
        zIndex: 99, transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", overflowY: "auto",
        boxShadow: menuOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Navigation</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-muted)", padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "12px 16px", borderRadius: 10,
                fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 600,
                color: isActive(to) ? "var(--gold)" : "var(--text-secondary)",
                background: isActive(to) ? "var(--gold-dim)" : "transparent",
                border: `1px solid ${isActive(to) ? "rgba(250,189,47,0.2)" : "transparent"}`,
                textDecoration: "none", transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default NavBar;
