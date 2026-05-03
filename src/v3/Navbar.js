import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

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

  return (
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
      <div className="nav-links" style={{ gap: 2 }}>
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
    </nav>
  );
}

export default NavBar;
