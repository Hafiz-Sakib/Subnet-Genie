export default function handler(req, res) {
  if (req.method === "POST") {
    const { baseIP, originalMask, hostRequirements } = req.body;

    const baseIPArray = baseIP.split(".").map(Number);
    if (
      baseIPArray.length !== 4 ||
      baseIPArray.some((octet) => octet < 0 || octet > 255)
    ) {
      return res.status(400).json({ error: "Invalid IP address" });
    }

    // Convert base IP to a 32-bit integer
    const baseIPInt =
      (baseIPArray[0] << 24) |
      (baseIPArray[1] << 16) |
      (baseIPArray[2] << 8) |
      baseIPArray[3];

    // Sort host requirements in descending order
    hostRequirements.sort((a, b) => b - a);

    const subnets = [];
    let currentIP = baseIPInt;

    // Calculate the subnet information
    hostRequirements.forEach((hosts) => {
      const neededBits = Math.ceil(Math.log2(hosts + 2)); // +2 for network & broadcast
      const mask = 32 - neededBits;

      // Check if the allocated mask is greater than the original mask
      if (mask < originalMask) {
        return res
          .status(400)
          .json({ error: "Not enough address space for subnet" });
      }

      const subnet = {
        requiredHosts: hosts,
        allocatedMask: mask,
        networkAddress: currentIP,
      };

      const subnetSize = 1 << (32 - mask);
      currentIP += subnetSize;

      // Calculate broadcast address and usable host range
      const broadcastAddress = subnet.networkAddress + subnetSize - 1;
      const firstHost = subnet.networkAddress + 1;
      const lastHost = broadcastAddress - 1;

      subnets.push({
        ...subnet,
        broadcastAddress,
        firstHost,
        lastHost,
        networkAddressIP: intToIP(subnet.networkAddress),
        broadcastAddressIP: intToIP(broadcastAddress),
        firstHostIP: intToIP(firstHost),
        lastHostIP: intToIP(lastHost),
      });
    });

    // Return the result as JSON
    return res.status(200).json({ subnets });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Helper function to convert integer to IP format
function intToIP(ip) {
  return `${(ip >> 24) & 0xff}.${(ip >> 16) & 0xff}.${(ip >> 8) & 0xff}.${
    ip & 0xff
  }`;
}
