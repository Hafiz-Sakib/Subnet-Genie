import { useRouter } from "next/router";

export default function VLSMOutput() {
  const router = useRouter();
  const { result } = router.query;

  if (!result) {
    return <div>Error: No data available.</div>;
  }

  const data = JSON.parse(result);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl mb-4">VLSM Subnet Calculation Results</h2>
      {data.subnets.map((subnet, index) => (
        <div key={index} className="mb-6">
          <h3 className="font-semibold">Subnet {index + 1}</h3>
          <p>Required Hosts: {subnet.requiredHosts}</p>
          <p>
            Network Address: {subnet.networkAddressIP}/{subnet.allocatedMask}
          </p>
          <p>Broadcast Address: {subnet.broadcastAddressIP}</p>
          <p>
            Usable Host Range: {subnet.firstHostIP} - {subnet.lastHostIP}
          </p>
          <hr />
        </div>
      ))}
    </div>
  );
}
