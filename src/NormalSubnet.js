import { useState } from "react";

function NormalSubnet() {
  const [subnetInput, setSubnetInput] = useState("");
  const [output, setOutput] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate the normal subnet (you will insert your algorithm here)
    setOutput("Calculation Result: Normal Subnet");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Normal Subnet Calculation</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={subnetInput}
          onChange={(e) => setSubnetInput(e.target.value)}
          className="border p-2 rounded"
          placeholder="Enter Subnet Info"
        />
        <button
          type="submit"
          className="mt-2 p-2 bg-blue-500 text-white rounded"
        >
          Calculate
        </button>
      </form>
      {output && <div className="mt-4">{output}</div>}
    </div>
  );
}

export default NormalSubnet;
