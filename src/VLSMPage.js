import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VLSMPage = () => {
  const [showModal, setShowModal] = useState(false); // Modal state
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      console.error("No input data found. Redirecting to the VLSM form.");
      setShowModal(true); // Show modal if no input data
      setTimeout(() => navigate("/"), 3000); // Redirect to Home after 3 seconds
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
      navigate("/vlsm-results", { state: { results } });
    } catch (error) {
      alert(error.message);
      navigate("/vlsm-form");
    }
  }, [location.state, navigate]);

  // Modal JSX
  const Modal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-md">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm mx-auto text-center">
        <h2 className="text-xl font-semibold text-red-600">Error!</h2>
        <p className="mt-4 text-gray-600">
          No input data found. Redirecting to home...
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {showModal && <Modal />}
      <div>Calculating VLSM, please wait...</div>
    </div>
  );
};

export default VLSMPage;
