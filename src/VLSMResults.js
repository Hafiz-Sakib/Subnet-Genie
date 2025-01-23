import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VLSMResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location?.state?.results; // Safe access
  console.log("VLSMResults Loaded", results);
  const [subnetResults, setSubnetResults] = useState([]);

  useEffect(() => {
    if (results) {
      setSubnetResults(results);
    } else {
      // Handle case where results are missing
      setSubnetResults([]);
    }
  }, [results]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-6xl w-full p-8 rounded-lg shadow-2xl bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          VLSM Calculation Results
        </h2>

        {subnetResults.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden">
              <div className="grid grid-cols-1 gap-6">
                {subnetResults.map((result) => (
                  <div
                    key={result.networkAddress} // Assuming unique network address
                    className="p-6 rounded-lg bg-teal-500 text-white"
                  >
                    <h3 className="text-2xl font-semibold mb-4">
                      Subnet: {result.requiredHosts} Hosts
                    </h3>
                    <p>
                      <strong>Subnet Mask:</strong> /{result.subnetMask}
                    </p>
                    <p>
                      <strong>Network Address:</strong> {result.networkAddress}
                    </p>
                    <p>
                      <strong>Broadcast Address:</strong>{" "}
                      {result.broadcastAddress}
                    </p>
                    <p>
                      <strong>Usable IP Range:</strong> {result.usableRange}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Subnet
                      </th>
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Required Hosts
                      </th>
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Subnet Mask
                      </th>
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Network Address
                      </th>
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Broadcast Address
                      </th>
                      <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                        Usable IP Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subnetResults.map((result) => (
                      <tr
                        key={result.networkAddress} // Assuming unique network address
                        className={`${
                          result.networkAddress.length % 2 === 0
                            ? "bg-teal-100"
                            : "bg-teal-200"
                        }`}
                      >
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          Subnet
                        </td>
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          {result.requiredHosts}
                        </td>
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          /{result.subnetMask}
                        </td>
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          {result.networkAddress}
                        </td>
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          {result.broadcastAddress}
                        </td>
                        <td className="py-4 px-6 sm:px-4 border-b text-lg text-gray-800">
                          {result.usableRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 text-xl">
            No results available.
          </p>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/vlsm-subnet")}
            className="px-8 py-4 sm:px-6 sm:py-3 bg-black text-white font-semibold rounded-lg focus:outline-none"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default VLSMResults;
