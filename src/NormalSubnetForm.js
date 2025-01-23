import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NormalSubnetForm() {
  const [ip, setIp] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert values to integers
    const baseIp = ipToInt(ip);
    const originalMaskInt = parseInt(originalMask);
    const numSubnetsInt = parseInt(numSubnets);

    // Calculate new mask
    const additionalBits = Math.ceil(Math.log2(numSubnetsInt));
    const newMask = originalMaskInt + additionalBits;

    if (newMask > 32) {
      alert("Not enough address space for the requested number of subnets.");
      return;
    }

    // Calculate subnets and redirect to result page
    const subnets = calculateSubnets(
      baseIp,
      originalMaskInt,
      newMask,
      numSubnetsInt
    );

    // Store the results in the session or state and navigate
    sessionStorage.setItem("subnets", JSON.stringify(subnets));
    navigate("/normal-subnet-results");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <div className="max-w-xl mx-auto p-8 bg-white bg-opacity-20 rounded-lg shadow-lg backdrop-blur-lg space-y-6">
        <h2 className="text-3xl font-extrabold text-center tracking-wide text-black drop-shadow-lg">
          FLSM Subnet Calculation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg text-black mb-2" htmlFor="ip">
              Base IP Address:
            </label>
            <input
              id="ip"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g., 192.168.1.0"
              required
              className="w-full px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              className="block text-lg text-black mb-2"
              htmlFor="originalMask"
            >
              Original Subnet Mask:
            </label>
            <input
              id="originalMask"
              type="number"
              value={originalMask}
              onChange={(e) => setOriginalMask(e.target.value)}
              placeholder="e.g., 24"
              required
              className="w-full px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              className="block text-lg text-black mb-2"
              htmlFor="numSubnets"
            >
              Number of Subnets:
            </label>
            <input
              id="numSubnets"
              type="number"
              value={numSubnets}
              onChange={(e) => setNumSubnets(e.target.value)}
              required
              className="w-full px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              Calculate Subnets
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-10 text-center text-sm bg-black bg-opacity-20 p-4 rounded-lg shadow-md">
        <div className="font-medium">
          Made with ❤️ by
          <a
            href="https://github.com/hafiz-sakib"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-300 hover:text-blue-500 underline transition-all"
          >
            Mohammad Hafizur Rahman Sakib
          </a>
        </div>
        <div className="mt-2 text-xs">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Helper functions
const ipToInt = (ip) => {
  const octets = ip.split(".").map(Number);
  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
};

const cidrToMask = (cidr) => {
  return cidr === 0 ? 0 : ~((1 << (32 - cidr)) - 1);
};

const alignIPToNetwork = (ip, mask) => {
  return ip & cidrToMask(mask);
};

const calculateSubnets = (baseIP, originalMask, newMask, numSubnets) => {
  const subnetSize = 1 << (32 - newMask);
  const alignedBaseIP = alignIPToNetwork(baseIP, originalMask);
  const subnets = [];

  for (let i = 0; i < numSubnets; i++) {
    const networkAddress = alignedBaseIP + i * subnetSize;
    const broadcastAddress = networkAddress + subnetSize - 1;
    const firstHost = networkAddress + 1;
    const lastHost = broadcastAddress - 1;

    subnets.push({
      subnet: i + 1,
      networkAddress: intToIP(networkAddress),
      subnetMask: intToIP(cidrToMask(newMask)),
      broadcastAddress: intToIP(broadcastAddress),
      firstHost: intToIP(firstHost),
      lastHost: intToIP(lastHost),
    });
  }

  return subnets;
};

const intToIP = (ip) => {
  return [
    (ip >> 24) & 0xff,
    (ip >> 16) & 0xff,
    (ip >> 8) & 0xff,
    ip & 0xff,
  ].join(".");
};

export default NormalSubnetForm;
