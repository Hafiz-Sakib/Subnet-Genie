import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
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
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/normal-subnet"
          className={`nav-link ${location.pathname === "/normal-subnet" || location.pathname === "/normal-subnet-results" ? "active" : ""}`}
        >
          FLSM
        </Link>
        <Link
          to="/vlsm-subnet"
          className={`nav-link ${location.pathname.includes("vlsm") ? "active" : ""}`}
        >
          VLSM
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
