import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NormalSubnetResult() {
  const [subnets, setSubnets] = useState([]);
  const navigate = useNavigate();

  const cardColors = [
    "bg-teal-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-blue-500",
  ];

  function getSubnetPrefixLength(subnetMask) {
    let binarySubnetMask = subnetMask
      .split(".")
      .map((octet) => parseInt(octet).toString(2).padStart(8, "0"))
      .join("");

    let prefixLength = binarySubnetMask.split("1").length - 1;
    return prefixLength;
  }

  useEffect(() => {
    const result = JSON.parse(sessionStorage.getItem("subnets"));
    if (result) {
      setSubnets(result);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-6xl w-full p-8 rounded-lg shadow-2xl bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Subnet Calculation Results
        </h2>

        {subnets.length > 0 ? (
          <div className="sm:hidden">
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-6">
              {subnets.map((subnet, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg ${
                    cardColors[index % cardColors.length]
                  } text-white`}
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    {subnet.subnet}
                  </h3>
                  <p>
                    <strong>Network Address:</strong> {subnet.networkAddress}/
                    {getSubnetPrefixLength(subnet.subnetMask)}
                  </p>
                  <p>
                    <strong>Subnet Mask:</strong> {subnet.subnetMask}
                  </p>
                  <p>
                    <strong>Broadcast Address:</strong>{" "}
                    {subnet.broadcastAddress}
                  </p>
                  <p>
                    <strong>First Host:</strong> {subnet.firstHost}
                  </p>
                  <p>
                    <strong>Last Host:</strong> {subnet.lastHost}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-xl">
            No results available.
          </p>
        )}

        <div className="hidden sm:block">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    Subnet
                  </th>
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    Network Address
                  </th>
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    Subnet Mask
                  </th>
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    Broadcast Address
                  </th>
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    First Host
                  </th>
                  <th className="py-4 px-6 sm:px-4 border-b text-lg font-semibold text-gray-800">
                    Last Host
                  </th>
                </tr>
              </thead>
              <tbody>
                {subnets.map((subnet, index) => (
                  <tr
                    key={index}
                    className={`${cardColors[index % cardColors.length]}`}
                  >
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.subnet}
                    </td>
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.networkAddress}/
                      {getSubnetPrefixLength(subnet.subnetMask)}
                    </td>
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.subnetMask}
                    </td>
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.broadcastAddress}
                    </td>
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.firstHost}
                    </td>
                    <td className="py-4 px-6 sm:px-4 border-b text-lg text-white">
                      {subnet.lastHost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/normal-subnet")}
            className="px-8 py-4 sm:px-6 sm:py-3 bg-black text-white font-semibold rounded-lg focus:outline-none"
          >
            Calculate Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default NormalSubnetResult;
