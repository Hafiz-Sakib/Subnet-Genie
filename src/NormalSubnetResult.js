import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NormalSubnetResult() {
  const [subnets, setSubnets] = useState([]);
  const navigate = useNavigate();

  function getSubnetPrefixLength(subnetMask) {
    // Convert the subnet mask to binary form
    let binarySubnetMask = subnetMask
      .split(".")
      .map((octet) => {
        return parseInt(octet).toString(2).padStart(8, "0");
      })
      .join("");

    // Count the number of 1s in the binary subnet mask
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        Subnet Calculation Results
      </h2>
      {subnets.length > 0 ? (
        subnets.map((subnet, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Subnet {subnet.subnet}
            </h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Network Address:</span>{" "}
              {subnet.networkAddress}/{getSubnetPrefixLength(subnet.subnetMask)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Subnet Mask:</span>{" "}
              {subnet.subnetMask}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Broadcast Address:</span>{" "}
              {subnet.broadcastAddress}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">First Host:</span>{" "}
              {subnet.firstHost}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Last Host:</span>{" "}
              {subnet.lastHost}
            </p>
            <hr className="border-gray-300" />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No results available.</p>
      )}

      {/* Calculate Again Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/normal-subnet")}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          Calculate Again
        </button>
      </div>
    </div>
  );
}

export default NormalSubnetResult;
