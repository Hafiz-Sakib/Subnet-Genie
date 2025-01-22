import { NextResponse } from "next/server";

export async function POST(request) {
  const { baseIP, originalMask, hostRequirements } = await request.json();

  // Helper function to convert IP to 32-bit integer
  const ipToInt = (ip) => {
    const octets = ip.split(".").map(Number);
    return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  };

  // Helper function to convert 32-bit integer to dotted decimal IP format
  const intToIP = (ip) => {
    return [
      (ip >> 24) & 0xff,
      (ip >> 16) & 0xff,
      (ip >> 8) & 0xff,
      ip & 0xff,
    ].join(".");
  };

  // Convert base IP to integer
  const baseIPInt = ipToInt(baseIP);

  // Sort subnets by descending order of host requirements
  const subnets = hostRequirements
    .map((hosts) => ({
      requiredHosts: hosts,
      allocatedMask: 0,
      networkAddress: 0,
    }))
    .sort((a, b) => b.requiredHosts - a.requiredHosts);

  // Perform VLSM calculation
  let currentIP = baseIPInt;
  for (let subnet of subnets) {
    const neededBits = Math.ceil(Math.log2(subnet.requiredHosts + 2)); // +2 for network and broadcast
    subnet.allocatedMask = 32 - neededBits;

    if (subnet.allocatedMask < originalMask) {
      return NextResponse.json({
        error: `Not enough address space for ${subnet.requiredHosts} hosts!`,
      });
    }

    subnet.networkAddress = currentIP;
    const subnetSize = 1 << (32 - subnet.allocatedMask);
    currentIP += subnetSize; // Move to the next subnet
  }

  // Prepare results
  const result = subnets.map((subnet, i) => {
    const networkAddress = subnet.networkAddress;
    const broadcastAddress =
      networkAddress + (1 << (32 - subnet.allocatedMask)) - 1;
    const firstHost = networkAddress + 1;
    const lastHost = broadcastAddress - 1;

    return {
      subnet: i + 1,
      requiredHosts: subnet.requiredHosts,
      networkAddress: intToIP(networkAddress),
      allocatedMask: subnet.allocatedMask,
      broadcastAddress: intToIP(broadcastAddress),
      usableHostRange: `${intToIP(firstHost)} - ${intToIP(lastHost)}`,
    };
  });

  return NextResponse.json(result);
}
