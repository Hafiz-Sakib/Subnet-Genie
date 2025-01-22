const Results = ({ baseIP, mask, subnets, hostRequirements }) => {
  return (
    <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-gray-700">
        Calculation Results
      </h3>
      <p>
        <strong>Base IP Address:</strong> {baseIP}
      </p>
      <p>
        <strong>Subnet Mask:</strong> {mask}
      </p>
      <p>
        <strong>Number of Subnets:</strong> {subnets}
      </p>
      <p>
        <strong>Host Requirements:</strong>{" "}
        {hostRequirements && hostRequirements.length > 0
          ? hostRequirements.join(", ")
          : "No host requirements provided"}
      </p>
    </div>
  );
};

export default Results;
