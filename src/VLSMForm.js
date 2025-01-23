import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VLSMForm = () => {
  const [baseIP, setBaseIP] = useState("");
  const [originalMask, setOriginalMask] = useState("");
  const [numSubnets, setNumSubnets] = useState("");
  const [hostRequirements, setHostRequirements] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data to be passed to the results page
    const formData = {
      baseIP,
      originalMask,
      hostRequirements: hostRequirements.map(Number),
    };

    // Navigate to the results page and pass the form data via state
    navigate("/vlsm-page", { state: formData });
  };

  const handleHostRequirementsChange = (e, index) => {
    const updatedHostRequirements = [...hostRequirements];
    updatedHostRequirements[index] = e.target.value;
    setHostRequirements(updatedHostRequirements);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <div className="max-w-xl mx-auto p-8 bg-white bg-opacity-20 rounded-lg shadow-lg backdrop-blur-lg space-y-6">
        <h2 className="text-3xl font-extrabold text-center tracking-wide text-black drop-shadow-lg">
          VLSM Subnet Calculation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg text-black mb-2" htmlFor="baseIP">
              Base IP Address:
            </label>
            <input
              id="baseIP"
              type="text"
              value={baseIP}
              onChange={(e) => setBaseIP(e.target.value)}
              placeholder="e.g. 192.168.1.0"
              required
              className="w-full px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              className="block text-lg text-black mb-2"
              htmlFor="originalMask"
            >
              Original Subnet Mask (/24):
            </label>
            <input
              id="originalMask"
              type="number"
              value={originalMask}
              onChange={(e) => setOriginalMask(e.target.value)}
              placeholder="e.g. 24"
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
              className="w-full px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dynamically generate host requirements inputs */}
          <div>
            <label className="block text-lg text-black mb-2">
              Required Hosts for each Subnet:
            </label>
            {Array.from({ length: numSubnets }, (_, index) => (
              <div key={index} className="flex items-center space-x-4 mb-4">
                <input
                  type="number"
                  value={hostRequirements[index] || ""}
                  onChange={(e) => handleHostRequirementsChange(e, index)}
                  className="w-3/4 px-4 py-3 border border-black rounded-lg bg-transparent text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Subnet ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              Calculate VLSM
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-10 text-center text-sm bg-black bg-opacity-20 p-4 rounded-lg shadow-md">
        <div className="font-medium">
          Developed by
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
};

export default VLSMForm;
