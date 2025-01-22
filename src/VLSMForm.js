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
    navigate("/vlsm-results", { state: formData });
  };

  const handleHostRequirementsChange = (e, index) => {
    const updatedHostRequirements = [...hostRequirements];
    updatedHostRequirements[index] = e.target.value;
    setHostRequirements(updatedHostRequirements);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">VLSM Subnet Calculation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base IP Address
          </label>
          <input
            type="text"
            value={baseIP}
            onChange={(e) => setBaseIP(e.target.value)}
            placeholder="e.g. 192.168.1.0"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Original Subnet Mask (/24)
          </label>
          <input
            type="number"
            value={originalMask}
            onChange={(e) => setOriginalMask(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Subnets
          </label>
          <input
            type="number"
            value={numSubnets}
            onChange={(e) => setNumSubnets(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Dynamically generate host requirements inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Required Hosts for each Subnet
          </label>
          {Array.from({ length: numSubnets }, (_, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                value={hostRequirements[index] || ""}
                onChange={(e) => handleHostRequirementsChange(e, index)}
                className="w-1/3 p-2 border border-gray-300 rounded-md"
                placeholder={`Subnet ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Calculate VLSM
        </button>
      </form>
    </div>
  );
};

export default VLSMForm;
