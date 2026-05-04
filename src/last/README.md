# SubCalc Pro — Professional Network Utility Suite

> A complete, offline-capable networking toolkit for engineers, students, and IT professionals. Built with React.

---

## Preview

```
┌─────────────────────────────────────────────────────────────────────┐
│  ■ SubCalc                          Home  FLSM  VLSM  IP Info  ···  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              Professional Network Utility Suite                     │
│                                                                     │
│                      SubCalc                                        │
│                        Pro                                          │
│                                                                     │
│       A complete networking toolkit for engineers —                 │
│       subnet calculators, IP analyzers, binary converters,          │
│       overlap detection, quizzes, and more.                         │
│                                                                     │
│         [ Start with FLSM → ]   [ VLSM Calculator ]                │
│                                                                     │
│  Tools Available: 15+  ·  IPv4 Support: Full  ·  Offline Ready     │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ ▦ FLSM       │  │ ◈ VLSM       │  │ ⓘ IP Info    │             │
│  │ Fixed Length │  │ Variable Len │  │ Analyzer     │             │
│  │ Subnetting   │  │ Subnetting   │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘

Mobile view (hamburger menu):
┌──────────────────────┐
│ ■ SubCalc        ☰  │
├──────────────────────┤
│                      │
│   SubCalc Pro        │
│   ...                │
└──────────────────────┘
     ┌────────────┐
     │ Navigation │  ✕
     ├────────────┤
     │ Home       │
     │ FLSM       │
     │ VLSM       │
     │ IP Info    │
     │ Binary     │
     │ CIDR       │
     │ ...        │
     └────────────┘
```

---

## Features

### 15 Networking Tools

| # | Tool | Route | Description |
|---|------|-------|-------------|
| 1 | **FLSM Calculator** | `/normal-subnet` | Divide a network into equal-sized subnets (Fixed Length Subnet Masking) |
| 2 | **VLSM Calculator** | `/vlsm-subnet` | Variable Length Subnet Masking — allocate by individual host requirements |
| 3 | **IP Address Analyzer** | `/ip-info` | Class, type, binary, hex, integer, RFC classification of any IPv4 address |
| 4 | **Binary ↔ Decimal Converter** | `/binary-converter` | Convert IPs between binary, decimal, hex, and integer formats |
| 5 | **CIDR Range Expander** | `/cidr-range` | Expand any CIDR block into full details: network, broadcast, host range |
| 6 | **Wildcard Mask Tool** | `/wildcard-mask` | Convert between subnet masks and wildcard masks for ACLs/routing |
| 7 | **Subnet Overlap Detector** | `/overlap-detector` | Detect overlapping subnets — critical for network design validation |
| 8 | **IP Class Identifier** | `/ip-class` | Identify classful network class (A/B/C/D/E) and default mask |
| 9 | **Network Summary Tool** | `/network-summary` | Summarize/aggregate multiple IP ranges into a supernet |
| 10 | **Subnet Visual Map** | `/subnet-visual-map` | Interactive tree visualization of subnet splits (click to inspect) |
| 11 | **IP Address Heatmap** | `/ip-heatmap` | Paint and plan IP allocations with a visual grid heatmap |
| 12 | **Subnet Comparison Table** | `/subnet-comparison` | Side-by-side comparison of multiple CIDR blocks with bar charts |
| 13 | **Subnetting Quiz** | `/subnet-quiz` | Timed quiz to test and sharpen subnetting skills |
| 14 | **Blog** | `/blog` | 12 in-depth networking articles (searchable, filterable) |

### Key Capabilities

- **Fully Responsive** — works on all screen sizes from 320px phones to 4K monitors
- **Hamburger menu** on mobile/tablet with smooth slide-in drawer
- **CSV Export** on FLSM, VLSM, Comparison, and Heatmap tools
- **Copy to clipboard** on every result field
- **Calculation history** (localStorage) on FLSM and VLSM forms
- **Quick example buttons** on every tool for instant demos
- **Dark theme** with animated background grid and glow orbs
- **Offline ready** — pure client-side, no backend required

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework |
| React Router DOM | 6+ | Client-side routing |
| Google Fonts | — | Syne + DM Mono typography |
| Create React App | latest | Build tooling |

No external charting libraries — all visualizations are built with pure CSS and React.

---

## Project Structure

```
src/
├── App.js                  # Homepage with tool grid
├── App.css                 # Global styles + responsive breakpoints
├── index.js                # Router setup — all 15 routes
├── index.css               # Tailwind base + root background
├── Navbar.js               # Responsive navbar with hamburger drawer
│
├── NormalSubnetForm.js     # FLSM calculator form
├── NormalSubnetResult.js   # FLSM results (table + visual mode)
├── VLSMForm.js             # VLSM input form
├── VLSMPage.js             # VLSM calculation middleware
├── VLSMResults.js          # VLSM results display
│
├── Ipinfo.js               # IP Address Analyzer
├── Binaryconverter.js      # Binary ↔ Decimal converter
├── Cidrrange.js            # CIDR Range Expander
├── Wildcardmask.js         # Wildcard Mask Tool
├── Overlapdetector.js      # Subnet Overlap Detector
├── Ipclass.js              # IP Class Identifier
├── NetworkSummary.js       # Network Summary / Supernetting
│
├── SubnetVisualMap.js      # Interactive subnet split tree [VISUALIZATION]
├── Ipheatmap.js            # IP address space heatmap [VISUALIZATION]
├── SubnetComparison.js     # Multi-subnet comparison table + bar chart
│
├── Subnetquiz.js           # Subnetting quiz with timer
├── Blog.js                 # Blog with 12 networking articles
│
├── vlsm_calculation.js     # Standalone VLSM logic (reference)
├── reportWebVitals.js      # Performance monitoring
└── setupTests.js           # Jest test setup
```

---

## Getting Started

### Prerequisites

- Node.js 16+ ([download](https://nodejs.org/))
- npm or yarn

### Installation

```bash
# 1. Clone or unzip the project
cd subcalc-pro

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

The app opens at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The `build/` folder contains the optimized static files — deploy to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

### Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json:
# "homepage": "https://yourusername.github.io/subcalc-pro",
# "predeploy": "npm run build",
# "deploy": "gh-pages -d build"

npm run deploy
```

---

## Responsive Design

The app is tested and optimized for these breakpoints:

| Breakpoint | Devices | Behavior |
|-----------|---------|----------|
| `> 1024px` | Desktop, large laptop | Full navbar with "More" dropdown |
| `≤ 1024px` | Small laptop, large tablet | Hamburger menu replaces navbar links |
| `≤ 768px` | Tablet | 1-column layouts, stacked forms |
| `≤ 480px` | Mobile | Compact spacing, touch-optimized buttons (min 44×44px) |
| `≤ 360px` | Small phone | Further size reductions |

### Mobile Navigation
- Hamburger icon (top-right) opens a **slide-in drawer** from the right
- All 15 navigation links available in the drawer
- Active route is highlighted in gold
- Drawer closes on: link tap, outside tap, or route change
- Body scroll is locked while drawer is open

---

## Tool Details

### FLSM Calculator
Enter a base IP, CIDR prefix, and number of subnets. The tool calculates the new mask, then lists every subnet with network address, broadcast, host range, and usable host count. Results export to CSV or copy individually.

### VLSM Calculator
Enter a base IP, original mask, and per-subnet host requirements. The algorithm sorts requirements largest-first, allocates the minimum block size for each, and outputs a complete allocation table.

### Subnet Visual Map *(Visualization)*
Enter any network (up to /28) and choose a split depth (1–4). The tool renders an interactive block diagram where each row represents one more bit of subnetting. Click any block to see its full details in an inspector panel.

```
10.0.0.0/8  ─────────────────────────────────────────
 /9    ████████████████████  ████████████████████
 /10   ██████  ██████        ██████  ██████
 /11   ███ ███ ███ ███        ███ ███ ███ ███
```

### IP Address Heatmap *(Visualization)*
Load any /16–/24 network. A 16×N grid of cells represents every IP address. Use the paint toolbar to mark addresses as Servers, Workstations, Network Devices, or Reserved. Stats sidebar updates live. Includes 3 preset configurations and CSV export.

### Subnet Comparison Table
Enter 2–8 CIDR blocks. The tool renders:
- Horizontal bar chart (log scale) comparing address space sizes
- Sortable detail table with network, broadcast, hosts, mask, wildcard, class
- Summary statistics (total addresses, private vs public, etc.)

---

## Networking Blog

12 in-depth articles are included in the `/blog` route:

1. Subnetting Fundamentals
2. VLSM Deep Dive
3. CIDR Explained
4. Private IP Ranges & RFC 1918
5. Wildcard Masks in ACLs
6. IPv6 Subnetting
7. OSPF Area Design
8. BGP Prefix Filtering
9. NAT Types Explained
10. Hierarchical Network Design
11. VLANs and Subnets
12. Systematic Network Troubleshooting

Articles support **search** (by title or summary) and **category filtering**.

---

## Keyboard Shortcuts

All input forms support pressing `Enter` to trigger the calculation.

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | iOS 14+ |
| Chrome Android | 90+ |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-tool`
3. Commit your changes: `git commit -m 'Add IPv6 calculator'`
4. Push to the branch: `git push origin feature/my-new-tool`
5. Open a Pull Request

### Adding a New Tool

1. Create `src/YourTool.js` — use `NavBar` from `./Navbar` and `./App.css`
2. Add a route in `src/index.js`
3. Add a card entry in the `tools` array in `src/App.js`
4. Follow the existing page structure: page-wrapper → bg-grid → NavBar → content → footer

---

## Known Limitations

- IPv4 only (IPv6 support is documented in the blog but not calculated)
- VLSM is limited to 32 subnets per calculation
- Heatmap grid shows max 256 addresses (first /24 of larger blocks)
- Subnet Visual Map supports up to 4 levels of splitting (to keep the UI readable)

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

**Mohammad Hafizur Rahman Sakib**
- GitHub: [@hafiz-sakib](https://github.com/hafiz-sakib)

---

## Changelog

### v2.0.0 (Current)
- Added Subnet Visual Map (interactive tree visualization)
- Added IP Address Heatmap (paint-to-plan grid)
- Added Subnet Comparison Table (multi-CIDR bar chart + sortable table)
- Added Network Summary / Supernetting tool
- Added IP Class Identifier
- Added Subnet Overlap Detector
- Added Wildcard Mask Tool
- Added 12-article Networking Blog
- **Full responsive redesign** — hamburger nav, mobile drawer, touch-optimized
- Responsive breakpoints: 1024px, 768px, 480px, 360px
- All tools: CSV export, copy-to-clipboard, localStorage history

### v1.0.0
- FLSM Calculator
- VLSM Calculator
- IP Info Analyzer
- Binary Converter
- CIDR Range Expander
- Subnetting Quiz
