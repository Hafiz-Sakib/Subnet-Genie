const Results = ({ results }) => (
  <div className="space-y-4 p-6 bg-white rounded-md shadow">
    <h2 className="text-lg font-bold">Subnetting Results</h2>
    {results.map((subnet, index) => (
      <div key={index} className="p-4 border rounded">
        <p>
          <strong>Subnet {index + 1}:</strong>
        </p>
        <p>
          Network Address: {subnet.networkAddress}/{subnet.allocatedMask}
        </p>
        <p>Broadcast Address: {subnet.broadcastAddress}</p>
        <p>
          Usable Range: {subnet.firstHost} - {subnet.lastHost}
        </p>
      </div>
    ))}
  </div>
);

export default Results;
