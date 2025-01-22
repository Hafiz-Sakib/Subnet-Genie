import React from "react";
import ReactDOM from "react-dom/client"; // Use `react-dom/client`
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import NormalSubnetForm from "./NormalSubnetForm";
import VlsmSubnet from "./VlsmSubnet";
import "./index.css";
import NormalSubnetResult from "./NormalSubnetResult";
// Create a root using createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/normal-subnet" element={<NormalSubnetForm />} />
      <Route path="/normal-subnet-results" element={<NormalSubnetResult />} />
      <Route path="/vlsm-subnet" element={<VlsmSubnet />} />
    </Routes>
  </Router>
);
