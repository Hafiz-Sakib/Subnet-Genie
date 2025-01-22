"use client"; // This directive marks the component as a client component

import { useState } from "react";

export default function NormalSubnet() {
  const [subnet, setSubnet] = useState("");

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl mb-4">Normal Subnet Calculation</h2>
      <form>
        <label className="block mb-2">Subnet Address</label>
        <input
          type="text"
          value={subnet}
          onChange={(e) => setSubnet(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter Subnet Address"
        />
        {/* Add other form fields and logic here */}
      </form>
    </div>
  );
}
