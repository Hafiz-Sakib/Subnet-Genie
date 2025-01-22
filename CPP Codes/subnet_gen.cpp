#include <iostream>
#include <string>
#include <cmath>
#include <sstream>
#include <iomanip>

using namespace std;

// Convert an integer to dotted decimal format
string intToIP(unsigned long ip)
{
    stringstream ss;
    ss << ((ip >> 24) & 0xFF) << "."
       << ((ip >> 16) & 0xFF) << "."
       << ((ip >> 8) & 0xFF) << "."
       << (ip & 0xFF);
    return ss.str();
}

// Convert a dotted decimal IP to a 32-bit integer
unsigned long ipToInt(const string &ip)
{
    unsigned long octets[4];
    if (sscanf(ip.c_str(), "%lu.%lu.%lu.%lu", &octets[0], &octets[1], &octets[2], &octets[3]) != 4)
    {
        throw invalid_argument("Invalid IP format. Please use dotted decimal notation.");
    }
    for (int i = 0; i < 4; ++i)
    {
        if (octets[i] > 255)
        {
            throw out_of_range("IP octet values must be between 0 and 255.");
        }
    }
    return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

// Generate a mask from a CIDR value
unsigned long cidrToMask(int cidr)
{
    return cidr == 0 ? 0 : ~((1UL << (32 - cidr)) - 1);
}

// Align the IP to the network boundary of the original mask
unsigned long alignIPToNetwork(unsigned long ip, int mask)
{
    return ip & cidrToMask(mask);
}

// Perform subnet calculations and display results
void calculateSubnets(unsigned long baseIP, int originalMask, int newMask, int numSubnets)
{
    unsigned long subnetSize = 1UL << (32 - newMask); // IPs per subnet
    baseIP = alignIPToNetwork(baseIP, originalMask);  // Align base IP to the network boundary

    cout << "Subnets for the given IP with " << numSubnets << " subnets (/" << newMask << "):" << endl;

    for (int i = 0; i < numSubnets; ++i)
    {
        // Calculate the network address for the current subnet
        unsigned long networkAddress = baseIP + (i * subnetSize);

        // Calculate the broadcast address for the current subnet
        unsigned long broadcastAddress = networkAddress + subnetSize - 1;

        // Ensure the broadcast address does not exceed 32 bits
        if (broadcastAddress < networkAddress || broadcastAddress > 0xFFFFFFFF)
        {
            cout << "Error: Subnet calculation overflowed. Exiting." << endl;
            break;
        }

        // Calculate the first and last host for the current subnet
        unsigned long firstHost = networkAddress + 1;
        unsigned long lastHost = broadcastAddress - 1;

        // Print the results for this subnet
        cout << "Subnet " << i + 1 << ":" << endl;
        cout << "  Network Address: " << intToIP(networkAddress) << "/" << newMask << endl;
        cout << "  Subnet Mask: " << intToIP(cidrToMask(newMask)) << endl;
        cout << "  Broadcast Address: " << intToIP(broadcastAddress) << endl;
        cout << "  First Host: " << intToIP(firstHost) << endl;
        cout << "  Last Host: " << intToIP(lastHost) << endl;
        cout << "-------------------------------" << endl;
    }
}

int main()
{
    string ip;
    int originalMask, numSubnets;

    try
    {
        cout << "Enter the base IP address (e.g., 192.168.1.0): ";
        cin >> ip;

        cout << "Enter the original subnet mask (e.g., 24 for /24): ";
        cin >> originalMask;

        if (originalMask < 0 || originalMask > 32)
        {
            throw invalid_argument("Invalid original subnet mask. It must be between 0 and 32.");
        }

        cout << "Enter the number of subnets: ";
        cin >> numSubnets;

        if (numSubnets <= 0)
        {
            throw invalid_argument("The number of subnets must be greater than 0.");
        }

        unsigned long baseIP = ipToInt(ip);

        // Calculate the new mask
        int additionalBits = ceil(log2(numSubnets));
        int newMask = originalMask + additionalBits;

        if (newMask > 32)
        {
            throw overflow_error("Not enough address space for the requested number of subnets.");
        }

        // Perform subnet calculations
        calculateSubnets(baseIP, originalMask, newMask, numSubnets);
    }
    catch (const exception &e)
    {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }

    return 0;
}
