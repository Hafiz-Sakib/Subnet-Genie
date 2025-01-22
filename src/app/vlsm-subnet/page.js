"use client"; // Add this directive to mark the component as client-side

import { useState } from "react";
import { useRouter } from "next/router";

export default function VLSMSubnet() {
  const router = useRouter();

  const [baseIP, setBaseIP] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState(0);
  const [hostRequirements, setHostRequirements] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for empty fields and incorrect inputs
    if (
      !baseIP ||
      !originalMask ||
      numSubnets <= 0 ||
      hostRequirements.some((host) => isNaN(host) || host <= 0)
    ) {
      setError("Please fill in all fields correctly.");
      return;
    }

    // Send data to the backend for calculation
    const response = await fetch("/api/calculateVLSM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baseIP,
        originalMask: parseInt(originalMask),
        hostRequirements,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Redirect to the output page with the results
      router.push({
        pathname: "/vlsm-output",
        query: { result: JSON.stringify(data) },
      });
    } else {
      setError("An error occurred during the calculation.");
    }
  };

  const handleHostChange = (index, value) => {
    const newRequirements = [...hostRequirements];
    newRequirements[index] = parseInt(value);
    setHostRequirements(newRequirements);
  };

  const handleNumSubnetsChange = (e) => {
    const newNumSubnets = parseInt(e.target.value);
    setNumSubnets(newNumSubnets);
    setHostRequirements(Array(newNumSubnets).fill("")); // Initialize host requirements array
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-3xl font-semibold mb-4 text-center">
        VLSM Subnet Calculation
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg">Base IP Address</label>
          <input
            type="text"
            value={baseIP}
            onChange={(e) => setBaseIP(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter Base IP (e.g., 192.168.1.0)"
          />
        </div>

        <div>
          <label className="block text-lg">
            Original Subnet Mask (e.g., 24)
          </label>
          <input
            type="number"
            value={originalMask}
            onChange={(e) => setOriginalMask(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter Subnet Mask"
          />
        </div>

        <div>
          <label className="block text-lg">Number of Subnets</label>
          <input
            type="number"
            value={numSubnets}
            onChange={handleNumSubnetsChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter the number of subnets"
          />
        </div>

        <div>
          <label className="block text-lg">
            Host Requirements for Each Subnet
          </label>
          {Array.from({ length: numSubnets }).map((_, index) => (
            <div key={index} className="flex items-center mb-2">
              <label className="mr-2">Subnet {index + 1}:</label>
              <input
                type="number"
                value={hostRequirements[index] || ""}
                onChange={(e) => handleHostChange(index, e.target.value)}
                className="w-24 p-3 border border-gray-300 rounded-md shadow-sm"
                placeholder="Hosts"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition"
        >
          Calculate
        </button>
      </form>
    </div>
  );
}
