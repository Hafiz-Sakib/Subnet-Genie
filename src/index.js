import React from "react";
import ReactDOM from "react-dom/client"; // Use `react-dom/client`
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import NormalSubnetForm from "./NormalSubnetForm";
import "./index.css";
import NormalSubnetResult from "./NormalSubnetResult";
import VLSMForm from "./VLSMForm";
import VLSMResults from "./VLSMResults";
// Create a root using createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/normal-subnet" element={<NormalSubnetForm />} />
      <Route path="/normal-subnet-results" element={<NormalSubnetResult />} />
      <Route path="/vlsm-subnet" element={<VLSMForm />} />
      <Route path="/vlsm-results" element={<VLSMResults />} />
    </Routes>
  </Router>
);
