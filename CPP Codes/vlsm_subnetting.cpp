#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
#include <stdexcept>

using namespace std;

// Structure to hold subnet information
struct Subnet
{
    int requiredHosts;
    int allocatedMask;
    unsigned long networkAddress;
};

// Convert integer to dotted decimal format
string intToIP(unsigned long ip)
{
    return to_string((ip >> 24) & 0xFF) + "." +
           to_string((ip >> 16) & 0xFF) + "." +
           to_string((ip >> 8) & 0xFF) + "." +
           to_string(ip & 0xFF);
}

// Calculate the aligned network address (clearing host bits based on the mask)
unsigned long alignToNetwork(unsigned long ip, int mask)
{
    return ip & (0xFFFFFFFF << (32 - mask));
}

// VLSM calculation
void calculateVLSM(unsigned long baseIP, int originalMask, vector<int> &hostRequirements)
{
    // Sort subnets by descending order of host requirements
    vector<Subnet> subnets;
    for (int hosts : hostRequirements)
    {
        subnets.push_back({hosts, 0, 0});
    }
    sort(subnets.begin(), subnets.end(), [](Subnet a, Subnet b)
         { return a.requiredHosts > b.requiredHosts; });

    // Allocate subnets
    unsigned long currentIP = baseIP;
    for (auto &subnet : subnets)
    {
        // Calculate the subnet mask for the required hosts
        int neededBits = ceil(log2(subnet.requiredHosts + 2)); // +2 for network & broadcast
        subnet.allocatedMask = 32 - neededBits;

        // Check if the allocated mask exceeds the original mask
        if (subnet.allocatedMask < originalMask)
        {
            cerr << "Error: Not enough address space for " << subnet.requiredHosts << " hosts!" << endl;
            return;
        }

        subnet.networkAddress = currentIP;
        unsigned long subnetSize = 1UL << (32 - subnet.allocatedMask);
        currentIP += subnetSize; // Move to the next subnet
    }

    // Output results
    cout << "VLSM Subnet Allocation:" << endl;
    for (size_t i = 0; i < subnets.size(); ++i)
    {
        unsigned long networkAddress = subnets[i].networkAddress;
        unsigned long broadcastAddress = networkAddress + (1UL << (32 - subnets[i].allocatedMask)) - 1;
        unsigned long firstHost = networkAddress + 1;
        unsigned long lastHost = broadcastAddress - 1;

        cout << "Subnet " << i + 1 << ":" << endl;
        cout << "  Required Hosts: " << subnets[i].requiredHosts << endl;
        cout << "  Network Address: " << intToIP(networkAddress) << "/" << subnets[i].allocatedMask << endl;
        cout << "  Broadcast Address: " << intToIP(broadcastAddress) << endl;
        cout << "  Usable Host Range: " << intToIP(firstHost) << " - " << intToIP(lastHost) << endl;
        cout << "-------------------------------" << endl;
    }
}

int main()
{
    string ip;
    int originalMask, numSubnets;

    try
    {
        // Input the base IP, original mask, and number of subnets
        cout << "Enter the base IP address (e.g., 192.168.1.0): ";
        cin >> ip;

        cout << "Enter the original subnet mask (e.g., 24 for /24): ";
        cin >> originalMask;
        if (originalMask < 0 || originalMask > 32)
        {
            throw invalid_argument("Invalid subnet mask. Must be between 0 and 32.");
        }

        cout << "Enter the number of subnets: ";
        cin >> numSubnets;
        if (numSubnets <= 0)
        {
            throw invalid_argument("Number of subnets must be greater than 0.");
        }

        // Convert IP to 32-bit integer
        unsigned long octets[4];
        if (sscanf(ip.c_str(), "%lu.%lu.%lu.%lu", &octets[0], &octets[1], &octets[2], &octets[3]) != 4)
        {
            throw invalid_argument("Invalid IP address format. Use dotted decimal (e.g., 192.168.1.0).");
        }
        for (int i = 0; i < 4; ++i)
        {
            if (octets[i] > 255)
            {
                throw out_of_range("IP address octets must be between 0 and 255.");
            }
        }
        unsigned long baseIP = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];

        // Align the base IP with the network block
        baseIP = alignToNetwork(baseIP, originalMask);

        // Input the host requirements for each subnet
        vector<int> hostRequirements(numSubnets);
        cout << "Enter the number of required hosts for each subnet:" << endl;
        for (int i = 0; i < numSubnets; ++i)
        {
            cout << "  Subnet " << i + 1 << ": ";
            cin >> hostRequirements[i];
            if (hostRequirements[i] < 0)
            {
                throw invalid_argument("Host requirements must be non-negative.");
            }
        }

        // Perform VLSM calculation
        calculateVLSM(baseIP, originalMask, hostRequirements);
    }
    catch (const exception &e)
    {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }

    return 0;
}
