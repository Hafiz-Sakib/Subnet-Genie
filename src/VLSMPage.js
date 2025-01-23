import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VLSMPage = () => {
  console.log("VLSMPage Loaded");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      console.error("No input data found. Redirecting to the VLSM form.");
      navigate("/vlsm-form");
      return;
    }

    const { baseIP, originalMask, hostRequirements } = location.state;

    // Function to calculate the VLSM subnets
    const calculateVLSM = (baseIP, originalMask, hostRequirements) => {
      const results = [];
      const toDecimalIP = (ip) =>
        ip
          .split(".")
          .reduce(
            (acc, octet, index) =>
              acc + (parseInt(octet, 10) << ((3 - index) * 8)),
            0
          );

      const toDottedDecimal = (ip) =>
        [24, 16, 8, 0].map((shift) => (ip >> shift) & 255).join(".");

      const toSubnetMask = (prefixLength) =>
        toDottedDecimal(~((1 << (32 - prefixLength)) - 1) >>> 0);

      const toWildcardMask = (prefixLength) =>
        toDottedDecimal((1 << (32 - prefixLength)) - 1);

      let currentIP = toDecimalIP(baseIP);

      hostRequirements
        .sort((a, b) => b - a) // Sort host requirements in descending order
        .forEach((hosts) => {
          const neededBits = Math.ceil(Math.log2(hosts + 2)); // +2 for network & broadcast
          const subnetMaskPrefix = 32 - neededBits;

          if (subnetMaskPrefix < originalMask) {
            throw new Error(`Not enough address space for ${hosts} hosts!`);
          }

          const subnetSize = 1 << (32 - subnetMaskPrefix);
          const networkAddress = currentIP;
          const broadcastAddress = networkAddress + subnetSize - 1;
          const firstHost = networkAddress + 1;
          const lastHost = broadcastAddress - 1;

          results.push({
            requiredHosts: hosts,
            subnetMaskCIDR: `${subnetMaskPrefix}`,
            subnetMaskDecimal: toSubnetMask(subnetMaskPrefix),
            wildcardMask: toWildcardMask(subnetMaskPrefix),
            networkAddress: toDottedDecimal(networkAddress),
            broadcastAddress: toDottedDecimal(broadcastAddress),
            usableRange: `${toDottedDecimal(firstHost)} ↔️ ${toDottedDecimal(
              lastHost
            )}`,
          });

          currentIP += subnetSize; // Move to the next available network address
        });

      return results;
    };

    // Run the algorithm and navigate to the results page
    try {
      const results = calculateVLSM(
        baseIP,
        parseInt(originalMask, 10),
        hostRequirements
      );
      console.log("Navigating with results:", results);
      navigate("/vlsm-results", { state: { results } });
    } catch (error) {
      alert(error.message);
      navigate("/vlsm-form");
    }
  }, [location.state, navigate]);

  return <div>Calculating VLSM, please wait...</div>;
};

export default VLSMPage;
