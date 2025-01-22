import { useState } from "react";

export default function NormalSubnet() {
  const [subnet, setSubnet] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // You will handle the subnet calculation here
    alert(`Subnet calculation for: ${subnet}`);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl mb-4">Normal Subnet Calculation</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">IP Address</label>
        <input
          type="text"
          value={subnet}
          onChange={(e) => setSubnet(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter IP address"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Calculate
        </button>
      </form>
    </div>
  );
}
