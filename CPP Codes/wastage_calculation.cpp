#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

using namespace std;

// Function to calculate the nearest power of 2 greater than or equal to a number
int nextPowerOf2(int num)
{
    return pow(2, ceil(log2(num)));
}

// Function to calculate wastage for FLSM
int calculateFLSMWastage(vector<int> &hostRequirements, int originalMask)
{
    int totalHosts = 0;
    for (int hosts : hostRequirements)
    {
        totalHosts += hosts;
    }

    // Calculate the total allocated IPs using the original mask
    int totalIPs = pow(2, 32 - originalMask);

    return totalIPs - totalHosts; // Total wastage
}

// Function to calculate wastage for VLSM
int calculateVLSMWastage(vector<int> &hostRequirements)
{
    int totalAllocatedIPs = 0;

    for (int hosts : hostRequirements)
    {
        int requiredIPs = nextPowerOf2(hosts + 2); // +2 for network & broadcast addresses
        totalAllocatedIPs += requiredIPs;
    }

    int totalHosts = 0;
    for (int hosts : hostRequirements)
    {
        totalHosts += hosts;
    }

    return totalAllocatedIPs - totalHosts; // Total wastage
}

int main()
{
    int originalMask, numSubnets;

    // Input the original mask and number of subnets
    cout << "Enter the original subnet mask (e.g., 15 for /15): ";
    cin >> originalMask;

    cout << "Enter the number of subnets: ";
    cin >> numSubnets;

    // Input the host requirements for each subnet
    vector<int> hostRequirements(numSubnets);
    cout << "Enter the number of required hosts for each subnet:" << endl;
    for (int i = 0; i < numSubnets; ++i)
    {
        cout << "  Subnet " << i + 1 << ": ";
        cin >> hostRequirements[i];
    }

    // Calculate wastage for FLSM
    int flsmWastage = calculateFLSMWastage(hostRequirements, originalMask);

    // Calculate wastage for VLSM
    int vlsmWastage = calculateVLSMWastage(hostRequirements);

    // Output results
    cout << "IP Address Wastage Comparison:" << endl;
    cout << "  FLSM Wastage: " << flsmWastage << " IPs" << endl;
    cout << "  VLSM Wastage: " << vlsmWastage << " IPs" << endl;

    return 0;
}
