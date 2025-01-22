import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import NormalSubnet from "./NormalSubnet";
import VlsmSubnet from "./VlsmSubnet";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/normal-subnet" element={<NormalSubnet />} />
      <Route path="/vlsm-subnet" element={<VlsmSubnet />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
