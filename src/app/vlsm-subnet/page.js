"use client"; // Mark this file as client component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use `next/navigation` for the App Router

export default function VLSMSubnet() {
  const router = useRouter();

  const [baseIP, setBaseIP] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState(0);
  const [hostRequirements, setHostRequirements] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !baseIP ||
      !originalMask ||
      numSubnets <= 0 ||
      hostRequirements.length !== numSubnets
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

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl mb-4">VLSM Subnet Calculation</h2>
      {error && <div className="text-red-500">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Base IP Address</label>
        <input
          type="text"
          value={baseIP}
          onChange={(e) => setBaseIP(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter Base IP (e.g., 192.168.1.0)"
        />

        <label className="block mb-2">Original Subnet Mask (e.g., 24)</label>
        <input
          type="number"
          value={originalMask}
          onChange={(e) => setOriginalMask(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter Subnet Mask"
        />

        <label className="block mb-2">Number of Subnets</label>
        <input
          type="number"
          value={numSubnets}
          onChange={(e) => setNumSubnets(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter the number of subnets"
        />

        <label className="block mb-2">Host Requirements for Each Subnet</label>
        {Array.from({ length: numSubnets }).map((_, index) => (
          <div key={index} className="flex items-center mb-2">
            <label className="mr-2">Subnet {index + 1}:</label>
            <input
              type="number"
              value={hostRequirements[index] || ""}
              onChange={(e) => handleHostChange(index, e.target.value)}
              className="w-24 p-2 border border-gray-300 rounded"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Calculate
        </button>
      </form>
    </div>
  );
}
