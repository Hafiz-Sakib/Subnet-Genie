import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const tools = [
  {
    to: "/normal-subnet",
    icon: "▦",
    color: "#fabd2f",
    bg: "rgba(250,189,47,0.1)",
    border: "rgba(250,189,47,0.2)",
    badge: "FLSM",
    badgeClass: "badge-gold",
    title: "Fixed Length Subnetting",
    desc: "Divide a network into equal-sized subnets with uniform prefix length.",
    features: [
      "Equal subnet sizes",
      "Simple to implement",
      "Predictable addressing",
    ],
  },
  {
    to: "/vlsm-subnet",
    icon: "◈",
    color: "#06d6a0",
    bg: "rgba(6,214,160,0.1)",
    border: "rgba(6,214,160,0.2)",
    badge: "VLSM",
    badgeClass: "badge-cyan",
    title: "Variable Length Subnetting",
    desc: "Allocate subnets based on individual host requirements for max efficiency.",
    features: ["Optimized space", "Flexible allocation", "Sorted by host need"],
  },
  {
    to: "/ip-info",
    icon: "ⓘ",
    color: "#a29bfe",
    bg: "rgba(162,155,254,0.1)",
    border: "rgba(162,155,254,0.2)",
    badge: "IP Info",
    badgeClass: "badge-purple",
    title: "IP Address Analyzer",
    desc: "Deep-dive into any IPv4 address — class, type, binary, RFC classification.",
    features: [
      "IP class detection",
      "Binary breakdown",
      "Private/public/reserved",
    ],
  },
  {
    to: "/binary-converter",
    icon: "⟺",
    color: "#74b9ff",
    bg: "rgba(116,185,255,0.1)",
    border: "rgba(116,185,255,0.2)",
    badge: "Converter",
    badgeClass: "badge-blue",
    title: "Binary ↔ Decimal IP",
    desc: "Convert IP addresses between binary, decimal, hex, and integer formats.",
    features: ["Bi-directional", "Octet visualization", "Hex & integer output"],
  },
  {
    to: "/cidr-range",
    icon: "⇔",
    color: "#fd79a8",
    bg: "rgba(253,121,168,0.1)",
    border: "rgba(253,121,168,0.2)",
    badge: "CIDR",
    badgeClass: "badge-pink",
    title: "CIDR Range Expander",
    desc: "Expand any CIDR notation into full host range, network, and broadcast info.",
    features: [
      "Instant expansion",
      "Host range output",
      "Mask format conversion",
    ],
  },
  {
    to: "/wildcard-mask",
    icon: "⊛",
    color: "#fd9644",
    bg: "rgba(253,150,68,0.1)",
    border: "rgba(253,150,68,0.2)",
    badge: "Wildcard",
    badgeClass: "badge-orange",
    title: "Wildcard Mask Tool",
    desc: "Convert between subnet masks and wildcard masks used in ACLs and routing.",
    features: ["Mask ↔ wildcard", "CIDR conversion", "ACL-ready output"],
  },
  {
    to: "/overlap-detector",
    icon: "⊕",
    color: "#06d6a0",
    bg: "rgba(6,214,160,0.08)",
    border: "rgba(6,214,160,0.2)",
    badge: "Overlap",
    badgeClass: "badge-cyan",
    title: "Subnet Overlap Detector",
    desc: "Check whether multiple subnets overlap — critical for network design.",
    features: ["Multi-subnet check", "Conflict detection", "Visual report"],
  },
  {
    to: "/ip-class",
    icon: "◉",
    color: "#fabd2f",
    bg: "rgba(250,189,47,0.08)",
    border: "rgba(250,189,47,0.2)",
    badge: "Class",
    badgeClass: "badge-gold",
    title: "IP Class Identifier",
    desc: "Identify the classful network class (A/B/C/D/E) and default mask.",
    features: ["Class A–E detection", "Default mask", "Usable host count"],
  },
  {
    to: "/subnet-quiz",
    icon: "?",
    color: "#a29bfe",
    bg: "rgba(162,155,254,0.08)",
    border: "rgba(162,155,254,0.2)",
    badge: "Quiz",
    badgeClass: "badge-purple",
    title: "Subnetting Quiz",
    desc: "Test and sharpen your subnetting skills with timed practice questions.",
    features: ["10 question sets", "Timed mode", "Score tracking"],
  },
  {
    to: "/network-summary",
    icon: "≡",
    color: "#74b9ff",
    bg: "rgba(116,185,255,0.08)",
    border: "rgba(116,185,255,0.2)",
    badge: "Summary",
    badgeClass: "badge-blue",
    title: "Network Summary Tool",
    desc: "Summarize and aggregate multiple IP ranges into a supernet.",
    features: [
      "Route aggregation",
      "Supernet calculation",
      "Prefix optimization",
    ],
  },
  {
    to: "/subnet-visual-map",
    icon: "🗺️",
    color: "#ff6b6b",
    bg: "rgba(255,107,107,0.1)",
    border: "rgba(255,107,107,0.2)",
    badge: "Visual",
    badgeClass: "badge-red",
    title: "Subnet Visual Map",
    desc: "Visualize subnet allocations and network structure on an interactive map.",
    features: ["Subnet layout", "Visual address blocks", "Easy comparison"],
  },
  {
    to: "/ip-heatmap",
    icon: "🔥",
    color: "#f0932b",
    bg: "rgba(240,147,43,0.1)",
    border: "rgba(240,147,43,0.2)",
    badge: "Heatmap",
    badgeClass: "badge-orange",
    title: "IP Heatmap",
    desc: "Analyze IP usage patterns with a heatmap view of network activity.",
    features: ["Usage patterns", "Hotspot detection", "Visual analytics"],
  },
  {
    to: "/subnet-comparison",
    icon: "⚖️",
    color: "#6c5ce7",
    bg: "rgba(108,92,231,0.1)",
    border: "rgba(108,92,231,0.2)",
    badge: "Compare",
    badgeClass: "badge-purple",
    title: "Subnet Comparison",
    desc: "Compare subnet sizes, host ranges, and efficiency side by side.",
    features: [
      "Side-by-side analysis",
      "Host count comparison",
      "Efficiency metrics",
    ],
  },
  {
    to: "/NetworkTrafficChart",
    icon: "📶",
    color: "#74b9ff",
    bg: "rgba(116,185,255,0.1)",
    border: "rgba(116,185,255,0.2)",
    badge: "Traffic",
    badgeClass: "badge-blue",
    title: "Network Traffic Chart",
    desc: "Visualize network traffic patterns and bandwidth usage over time with interactive charts.",
    features: ["Bandwidth trends", "Traffic analysis", "Interactive graph"],
  },
  {
    to: "/SubnetPieChart",
    icon: "🥧",
    color: "#fd79a8",
    bg: "rgba(253,121,168,0.1)",
    border: "rgba(253,121,168,0.2)",
    badge: "Pie Chart",
    badgeClass: "badge-pink",
    title: "Subnet Pie Chart",
    desc: "Visualize subnet allocation and IP address distribution as an interactive pie chart.",
    features: ["Allocation view", "IP distribution", "Interactive slices"],
  },
  {
    to: "/iptimeline",
    icon: "📅",
    color: "#06d6a0",
    bg: "rgba(6,214,160,0.1)",
    border: "rgba(6,214,160,0.2)",
    badge: "Timeline",
    badgeClass: "badge-cyan",
    title: "IP Timeline",
    desc: "Track and visualize subnet utilization trends across time with a multi-series line chart.",
    features: ["Utilization trends", "Multi-subnet view", "Hover inspection"],
  },
];

function App() {
  return (
    <div className="page-wrapper" style={{ background: "var(--bg-deep)" }}>
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(250,189,47,0.1) 0%, transparent 70%)",
          top: -200,
          right: -200,
          animation: "pulse-glow 6s ease-in-out infinite",
        }}
      />
      <div
        className="bg-glow-orb"
        style={{
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(6,214,160,0.07) 0%, transparent 70%)",
          bottom: 0,
          left: -100,
          animation: "pulse-glow 8s ease-in-out infinite 2s",
        }}
      />

      <NavBar />

      <div
        className="page-content"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 40px" }}
      >
        {/* Hero */}
        <div
          className="animate-fadeInUp"
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div className="section-tag" style={{ justifyContent: "center" }}>
            Professional Network Utility Suite
          </div>
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            SubCalc
            <br />
            <span style={{ color: "var(--gold)" }}>Pro</span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              maxWidth: 500,
              margin: "0 auto 32px",
              lineHeight: 1.8,
            }}
          >
            A complete networking toolkit for engineers — subnet calculators, IP
            analyzers, binary converters, overlap detection, quizzes, and more.
          </p>
          <div
            className="hero-buttons"
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/normal-subnet" className="btn-primary">
              Start with FLSM →
            </Link>
            <Link
              to="/vlsm-subnet"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                background: "var(--cyan-dim)",
                color: "var(--cyan)",
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 32px",
                borderRadius: 8,
                border: "1px solid rgba(6,214,160,0.25)",
              }}
            >
              VLSM Calculator
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="card animate-fadeInUp stagger-1"
          style={{
            padding: "20px 32px",
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          {[
            { label: "Tools Available", value: "16+" },
            { label: "IPv4 Support", value: "Full" },
            { label: "CIDR Notation", value: "Yes" },
            { label: "CSV Export", value: "Yes" },
            { label: "History Log", value: "Yes" },
            { label: "Offline Ready", value: "Yes" },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {value}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-tag">All Tools</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Choose a Calculator
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 32,
            }}
          >
            16 professional networking tools in one place.
          </p>
        </div>

        <div
          className="tool-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {tools.map((tool, i) => (
            <Link
              key={tool.to}
              to={tool.to}
              className={`tool-card animate-fadeInUp stagger-${Math.min(i + 1, 5)}`}
              style={{ borderColor: tool.border, textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  className="tool-card-icon"
                  style={{
                    background: tool.bg,
                    color: tool.color,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {tool.icon}
                </div>
                <span className={`badge ${tool.badgeClass}`}>{tool.badge}</span>
              </div>
              <div>
                <div className="tool-card-title">{tool.title}</div>
                <div className="tool-card-desc" style={{ marginTop: 6 }}>
                  {tool.desc}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tool.features.map((f) => (
                  <span key={f} className="chip" style={{ fontSize: 10 }}>
                    {f}
                  </span>
                ))}
              </div>
              <div className="tool-card-arrow" style={{ color: tool.color }}>
                →
              </div>
            </Link>
          ))}
        </div>

        {/* Blog teaser */}
        <div
          className="card animate-fadeInUp stagger-3"
          style={{
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            borderColor: "rgba(250,189,47,0.15)",
          }}
        >
          <div>
            <div className="section-tag">Knowledge Base</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Networking Blog
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              Deep-dives into subnetting, VLSM, CIDR, routing protocols, and
              modern network design.
            </p>
          </div>
          <Link to="/blog" className="btn-primary">
            Read Articles →
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

export default App;
