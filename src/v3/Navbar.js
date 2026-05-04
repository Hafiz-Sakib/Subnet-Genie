import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/normal-subnet", label: "FLSM" },
    { to: "/vlsm-subnet", label: "VLSM" },
    { to: "/ip-info", label: "IP Info" },
    { to: "/binary-converter", label: "Binary" },
    { to: "/cidr-range", label: "CIDR" },
    { to: "/subnet-quiz", label: "Quiz" },
    { to: "/blog", label: "Blog" },
  ];

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="nav-bar">
        <Link to="/" className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect
              x="1"
              y="1"
              width="9"
              height="9"
              rx="2"
              fill="#fabd2f"
              opacity="0.9"
            />
            <rect
              x="12"
              y="1"
              width="9"
              height="9"
              rx="2"
              fill="#fabd2f"
              opacity="0.4"
            />
            <rect
              x="1"
              y="12"
              width="9"
              height="9"
              rx="2"
              fill="#fabd2f"
              opacity="0.4"
            />
            <rect
              x="12"
              y="12"
              width="9"
              height="9"
              rx="2"
              fill="#06d6a0"
              opacity="0.8"
            />
          </svg>
          Sub<span>Calc</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {links.map(({ to, label }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link ${active ? "active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="nav-menu-mobile">
          <div className="nav-menu-content">
            {links.map(({ to, label }) => {
              const active =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`nav-menu-link ${active ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;
