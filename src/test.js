// Function to convert integer to dotted decimal format
function intToIP(ip) {
  return (
    ((ip >> 24) & 0xff) +
    "." +
    ((ip >> 16) & 0xff) +
    "." +
    ((ip >> 8) & 0xff) +
    "." +
    (ip & 0xff)
  );
}

// Function to align the IP address with the subnet mask
function alignToNetwork(ip, mask) {
  return ip & (0xffffffff << (32 - mask));
}

// Function to calculate VLSM
function calculateVLSM(baseIP, originalMask, hostRequirements) {
  // Sort subnets by descending order of host requirements
  let subnets = hostRequirements.map((hosts) => ({
    requiredHosts: hosts,
    allocatedMask: 0,
    networkAddress: 0,
  }));

  subnets.sort((a, b) => b.requiredHosts - a.requiredHosts);

  // Allocate subnets
  let currentIP = baseIP;
  for (let subnet of subnets) {
    // Calculate the subnet mask for the required hosts
    let neededBits = Math.ceil(Math.log2(subnet.requiredHosts + 2)); // +2 for network & broadcast
    subnet.allocatedMask = 32 - neededBits;

    // Check if the allocated mask exceeds the original mask
    if (subnet.allocatedMask < originalMask) {
      console.error(
        `Error: Not enough address space for ${subnet.requiredHosts} hosts!`
      );
      return;
    }

    subnet.networkAddress = currentIP;
    let subnetSize = 1 << (32 - subnet.allocatedMask);
    currentIP += subnetSize; // Move to the next subnet
  }

  // Output results
  console.log("VLSM Subnet Allocation:");
  subnets.forEach((subnet, i) => {
    let networkAddress = subnet.networkAddress;
    let broadcastAddress =
      networkAddress + (1 << (32 - subnet.allocatedMask)) - 1;
    let firstHost = networkAddress + 1;
    let lastHost = broadcastAddress - 1;

    console.log(`Subnet ${i + 1}:`);
    console.log(`  Required Hosts: ${subnet.requiredHosts}`);
    console.log(
      `  Network Address: ${intToIP(networkAddress)}/${subnet.allocatedMask}`
    );
    console.log(`  Broadcast Address: ${intToIP(broadcastAddress)}`);
    console.log(
      `  Usable Host Range: ${intToIP(firstHost)} - ${intToIP(lastHost)}`
    );
    console.log("-------------------------------");
  });
}

// Static input values
const ip = "10.20.30.40"; // Base IP address
const originalMask = 12; // Original subnet mask (e.g., /24)
const numSubnets = 3; // Number of subnets

// Host requirements for each subnet
const hostRequirements = [1020, 512, 250]; // Example: 3 subnets with 100, 50, and 30 hosts

// Convert IP to 32-bit integer
const octets = ip.split(".").map((octet) => parseInt(octet));
if (octets.length !== 4 || octets.some((octet) => octet < 0 || octet > 255)) {
  console.error(
    "Invalid IP address format. Use dotted decimal (e.g., 192.168.1.0)."
  );
} else {
  let baseIP =
    (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];

  // Align the base IP with the network block
  baseIP = alignToNetwork(baseIP, originalMask);

  // Perform VLSM calculation
  calculateVLSM(baseIP, originalMask, hostRequirements);
}
