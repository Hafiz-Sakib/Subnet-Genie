import React from "react";
import ReactDOM from "react-dom/client"; // Use `react-dom/client`
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import NormalSubnet from "./NormalSubnet";
import VlsmSubnet from "./VlsmSubnet";
import "./index.css";
// Create a root using createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/normal-subnet" element={<NormalSubnet />} />
      <Route path="/vlsm-subnet" element={<VlsmSubnet />} />
    </Routes>
  </Router>
);
