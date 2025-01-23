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

    // Function to convert integer to dotted decimal format
    const intToIP = (ip) => {
      return (
        ((ip >> 24) & 0xff) +
        "." +
        ((ip >> 16) & 0xff) +
        "." +
        ((ip >> 8) & 0xff) +
        "." +
        (ip & 0xff)
      );
    };

    // Function to align the IP address with the subnet mask
    const alignToNetwork = (ip, mask) => {
      return ip & (0xffffffff << (32 - mask));
    };

    // Function to calculate VLSM
    const calculateVLSM = (baseIP, originalMask, hostRequirements) => {
      const results = [];
      const subnets = hostRequirements.map((hosts) => ({
        requiredHosts: hosts,
        allocatedMask: 0,
        networkAddress: 0,
      }));

      subnets.sort((a, b) => b.requiredHosts - a.requiredHosts);

      let currentIP = baseIP;

      subnets.forEach((subnet) => {
        const neededBits = Math.ceil(Math.log2(subnet.requiredHosts + 2)); // +2 for network & broadcast
        subnet.allocatedMask = 32 - neededBits;

        if (subnet.allocatedMask < originalMask) {
          throw new Error(
            `Not enough address space for ${subnet.requiredHosts} hosts!`
          );
        }

        subnet.networkAddress = currentIP;
        const subnetSize = 1 << (32 - subnet.allocatedMask);
        currentIP += subnetSize;

        const networkAddress = subnet.networkAddress;
        const broadcastAddress = networkAddress + subnetSize - 1;
        const firstHost = networkAddress + 1;
        const lastHost = broadcastAddress - 1;

        results.push({
          requiredHosts: subnet.requiredHosts,
          subnetMaskCIDR: `${subnet.allocatedMask}`,
          networkAddress: intToIP(networkAddress),
          broadcastAddress: intToIP(broadcastAddress),
          usableRange: `${intToIP(firstHost)} ↔️ ${intToIP(lastHost)}`,
        });
      });

      return results;
    };

    try {
      // Convert base IP to 32-bit integer and align with the network block
      const octets = baseIP.split(".").map((octet) => parseInt(octet));
      let baseIPInt =
        (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
      baseIPInt = alignToNetwork(baseIPInt, originalMask);

      // Perform VLSM calculation
      const results = calculateVLSM(baseIPInt, originalMask, hostRequirements);
      navigate("/vlsm-results", { state: { results } });
    } catch (error) {
      alert(error.message);
      navigate("/");
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
