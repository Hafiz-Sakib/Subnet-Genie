import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const VLSMResults = () => {
  const location = useLocation();
  const results = location?.state?.results; // Safe access
  console.log("VLSMResults Loaded", results);
  const [subnetResults, setSubnetResults] = useState([]);

  useEffect(() => {
    // Update the state with the results from the previous page
    if (results) {
      setSubnetResults(results);
    }
  }, [results]); // Re-run when the results change

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">VLSM Calculation Results</h2>
      <div className="space-y-4">
        {subnetResults.length > 0 ? (
          subnetResults.map((result, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h3 className="text-xl font-semibold">
                Subnet {index + 1}: {result.requiredHosts} Hosts
              </h3>
              <p>Subnet Mask: /{result.subnetMask}</p>
              <p>Network Address: {result.networkAddress}</p>
              <p>Broadcast Address: {result.broadcastAddress}</p>
              <p>Usable IP Range: {result.usableRange}</p>
            </div>
          ))
        ) : (
          <p>No results to display.</p>
        )}
      </div>
    </div>
  );
};

export default VLSMResults;
