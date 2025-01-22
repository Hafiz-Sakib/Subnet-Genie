// Utility to convert integer to dotted decimal format
const intToIP = (ip) => {
  return `${(ip >> 24) & 0xff}.${(ip >> 16) & 0xff}.${(ip >> 8) & 0xff}.${
    ip & 0xff
  }`;
};

// Align base IP to the network address based on the mask
const alignToNetwork = (ip, mask) => {
  return ip & (0xffffffff << (32 - mask));
};

// Main VLSM calculation function
export const calculateVLSM = (baseIP, originalMask, hostRequirements) => {
  // Convert base IP to integer
  const ipParts = baseIP.split(".").map(Number);
  const baseIPInt =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

  // Align base IP to the network
  let currentIP = alignToNetwork(baseIPInt, originalMask);

  // Sort subnets by descending order of host requirements
  const subnets = hostRequirements
    .map((hosts, index) => ({
      requiredHosts: hosts,
      allocatedMask: 0,
      networkAddress: 0,
      index,
    }))
    .sort((a, b) => b.requiredHosts - a.requiredHosts);

  const results = [];

  // Allocate subnets
  for (const subnet of subnets) {
    const neededBits = Math.ceil(Math.log2(subnet.requiredHosts + 2)); // +2 for network & broadcast
    subnet.allocatedMask = 32 - neededBits;

    // Check if the allocated mask exceeds the original mask
    if (subnet.allocatedMask < originalMask) {
      throw new Error(
        `Not enough address space for ${subnet.requiredHosts} hosts!`
      );
    }

    subnet.networkAddress = currentIP;

    const subnetSize = 1 << (32 - subnet.allocatedMask);
    const broadcastAddress = currentIP + subnetSize - 1;
    const firstHost = currentIP + 1;
    const lastHost = broadcastAddress - 1;

    results.push({
      requiredHosts: subnet.requiredHosts,
      networkAddress: `${intToIP(subnet.networkAddress)}/${
        subnet.allocatedMask
      }`,
      broadcastAddress: intToIP(broadcastAddress),
      usableRange: `${intToIP(firstHost)} - ${intToIP(lastHost)}`,
    });

    // Move to the next subnet
    currentIP += subnetSize;
  }

  return results;
};
