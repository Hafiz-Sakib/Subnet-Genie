import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VLSMPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

    let currentIP = toDecimalIP(baseIP);

    hostRequirements
      .sort((a, b) => b - a)
      .forEach((hosts) => {
        const neededBits = Math.ceil(Math.log2(hosts + 2)); // +2 for network & broadcast
        const subnetMask = 32 - neededBits;

        if (subnetMask < originalMask) {
          throw new Error(`Not enough address space for ${hosts} hosts!`);
        }

        const subnetSize = 1 << (32 - subnetMask);
        const networkAddress = currentIP;
        const broadcastAddress = networkAddress + subnetSize - 1;
        const firstHost = networkAddress + 1;
        const lastHost = broadcastAddress - 1;

        results.push({
          requiredHosts: hosts,
          subnetMask,
          networkAddress: toDottedDecimal(networkAddress),
          broadcastAddress: toDottedDecimal(broadcastAddress),
          usableRange: `${toDottedDecimal(firstHost)} - ${toDottedDecimal(
            lastHost
          )}`,
        });

        currentIP += subnetSize;
      });

    return results;
  };

  // Run the algorithm and navigate to results
  try {
    const results = calculateVLSM(
      baseIP,
      parseInt(originalMask, 10),
      hostRequirements
    );
    console.log("Results:", results);
    navigate("/vlsm-results", { state: { results } }); // Passing results to the VLSMResults page
  } catch (error) {
    alert(error.message);
  }

  return null; // This page won't render anything, it just processes the input
};

export default VLSMPage;
