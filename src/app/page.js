"use client"; // This makes the file a client component

import { useState } from "react";
import InputForm from "../components/InputForm";
import Results from "../components/Results";
import { calculateVLSM } from "../utilities/vlsm";

const Page = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleCalculate = (baseIP, originalMask, hostRequirements) => {
    try {
      const calculatedResults = calculateVLSM(
        baseIP,
        originalMask,
        hostRequirements
      );
      setResults(calculatedResults);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subnet Calculator</h1>
      <InputForm onCalculate={handleCalculate} />
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <Results results={results} />
    </div>
  );
};

export default Page;
