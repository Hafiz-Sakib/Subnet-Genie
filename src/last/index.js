import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import NormalSubnetForm from "./NormalSubnetForm";
import NormalSubnetResult from "./NormalSubnetResult";
import VLSMForm from "./VLSMForm";
import VLSMResults from "./VLSMResults";
import VLSMPage from "./VLSMPage";
import IPInfo from "./Ipinfo";
import BinaryConverter from "./Binaryconverter";
import CIDRRange from "./Cidrrange";
import WildcardMask from "./Wildcardmask";
import OverlapDetector from "./Overlapdetector";
import IPClass from "./Ipclass";
import SubnetQuiz from "./Subnetquiz";
import NetworkSummary from "./NetworkSummary";
import Blog from "./Blog";
import SubnetVisualMap from "./Subnetvisualmap";
import IPHeatmap from "./Ipheatmap";
import Subnetcomparison from "./Subnetcomparison";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/normal-subnet" element={<NormalSubnetForm />} />
      <Route path="/normal-subnet-results" element={<NormalSubnetResult />} />
      <Route path="/vlsm-subnet" element={<VLSMForm />} />
      <Route path="/vlsm-page" element={<VLSMPage />} />
      <Route path="/vlsm-results" element={<VLSMResults />} />
      <Route path="/ip-info" element={<IPInfo />} />
      <Route path="/binary-converter" element={<BinaryConverter />} />
      <Route path="/cidr-range" element={<CIDRRange />} />
      <Route path="/wildcard-mask" element={<WildcardMask />} />
      <Route path="/overlap-detector" element={<OverlapDetector />} />
      <Route path="/ip-class" element={<IPClass />} />
      <Route path="/subnet-quiz" element={<SubnetQuiz />} />
      <Route path="/network-summary" element={<NetworkSummary />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/subnet-visual-map" element={<SubnetVisualMap />} />
      <Route path="/ip-heatmap" element={<IPHeatmap />} />
      <Route path="/subnet-comparison" element={<Subnetcomparison />} />
    </Routes>
  </Router>,
);
