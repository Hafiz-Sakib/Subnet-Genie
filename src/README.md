# 🌐 SubCalc Pro

**SubCalc Pro** is a responsive React application that provides a complete networking toolkit for IPv4 subnetting, IP address analysis, and network planning.

It includes FLSM and VLSM calculators, address and mask converters, visual subnet maps, subnet comparison tools, quizzes, and more.

🔗 Live demo: [SubCalc Pro](https://subcalc-pro.vercel.app/)

## 📸 Website Screenshot

![SubCalc Pro Screenshot](./asset%20for%20readme/screenshot1.jpeg)

## ✨ Overview

SubCalc Pro helps network engineers, students, and IT professionals to:

- design and verify IPv4 subnets
- calculate subnet ranges and masks
- compare network allocations
- visualize subnet layouts
- test subnetting knowledge

The app is built with **React**, **React Router**, and **Tailwind CSS**.

---

## 🚀 Available Tools

The application currently includes the following tools and pages:

- **Fixed Length Subnetting (FLSM)**
  - Divide a network into equal-sized subnets
  - Calculate network address, broadcast address, mask, wildcard mask, and usable host range

- **Variable Length Subnetting (VLSM)**
  - Allocate subnets based on different host requirements
  - Keep space usage efficient by sorting subnets and assigning correct prefix sizes

- **IP Address Analyzer**
  - Identify IPv4 class (A/B/C/D/E)
  - Detect private, public, and reserved address ranges
  - Show binary, hexadecimal, and decimal conversions

- **Binary Converter**
  - Convert between binary and decimal IPv4 formats
  - Support octet-level conversion and format visualization

- **CIDR Range Expander**
  - Expand a CIDR notation into network range, broadcast address, and host range
  - Convert CIDR to mask and wildcard mask

- **Wildcard Mask Tool**
  - Convert subnet masks to wildcard masks and back
  - Use results for access control lists (ACLs) and routing rules

- **Subnet Overlap Detector**
  - Verify whether multiple subnets overlap
  - Prevent address plan conflicts in network design

- **IP Class Identifier**
  - Detect classful network categories and recommended masks
  - Display default masks and usable host counts

- **Subnet Quiz**
  - Practice subnetting questions
  - Challenge your knowledge with multiple question sets and scoring feedback

- **Network Summary Tool**
  - Aggregate multiple networks into a supernet
  - Compare summarized subnet results, prefix optimization, and totals

- **Subnet Visual Map**
  - Visualize subnet splits and block allocations
  - Click blocks to inspect network details and host ranges

- **IP Heatmap**
  - Analyze IP distribution and usage patterns visually
  - Understand how IP blocks relate to heatmap density

- **Subnet Comparison**
  - Compare subnet sizes and host capacities side by side
  - Review efficiency and address usage for multiple subnets

- **Blog / Knowledge Base**
  - Read networking-related content and subnetting guides
  - Learn subnetting concepts directly within the app

- **IP Timeline**
  - Visualize IP address allocation and changes over time
  - Track historical subnetting operations and network evolution

- **Network Traffic Chart**
  - Display network traffic patterns and data flow visualization
  - Analyze bandwidth usage and network performance metrics

- **Subnet Pie Chart**
  - Illustrate subnet distribution and allocation proportions
  - Provide a graphical breakdown of subnet sizes and host capacities

---

## 🛠️ Technologies Used

- **React**
- **React Router DOM**
- **Tailwind CSS**
- **React Scripts**
- **PostCSS + Autoprefixer**

---

## 💻 Installation

### Prerequisites

You need **Node.js** and **npm** installed:

- **Node.js:** https://nodejs.org
- **npm:** bundled with Node.js

### Install dependencies

```bash
npm install
```

---

## ▶️ Run Locally

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

---

## 🧪 Testing

```bash
npm test
```

---

## 💡 Notes

- The app is designed to be responsive across desktop, tablet, and mobile screens.
- Navigation is handled using a modern sidebar/header menu with mobile-friendly hamburger navigation.
- Many tools support copy-to-clipboard and compact summary displays for fast workflow.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a branch for your change.
3. Commit your updates.
4. Open a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">Made with ❤️ by Mohammad Hafizur Rahman Sakib</div>
