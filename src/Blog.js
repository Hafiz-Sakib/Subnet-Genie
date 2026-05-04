import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

const ARTICLES = [
  {
    id: 1,
    slug: "subnetting-fundamentals",
    title: "Subnetting Fundamentals: A Complete Beginner's Guide",
    category: "Fundamentals",
    badge: "badge-gold",
    readTime: "8 min",
    date: "Apr 12, 2025",
    summary:
      "Subnetting divides a large IP network into smaller, more manageable segments. Learn why this matters and how to calculate subnets by hand.",
    content: `
Subnetting is one of the most fundamental skills in networking. At its core, subnetting means dividing a large IP address space into smaller, logical sub-networks called subnets.

**Why Do We Subnet?**

Without subnetting, a single network could have millions of devices — all sharing the same broadcast domain. Every broadcast packet would reach every device, creating massive congestion. Subnetting solves this by:
- Reducing broadcast domains
- Improving network performance and security
- Enabling hierarchical routing
- Making IP address allocation more efficient

**The Subnet Mask**

A subnet mask defines which portion of an IP address is the network part and which is the host part. For example, 255.255.255.0 (or /24) means the first 24 bits are the network address. Any IP with those same 24 bits is in the same subnet.

**CIDR Notation**

Classless Inter-Domain Routing (CIDR) uses a prefix length like /24 instead of writing out the full mask. This makes it faster to read and work with. /24 = 256 total addresses, /25 = 128, /26 = 64, and so on — each step halving the block size.

**Calculating Subnets**

For any given prefix /n:
- Total addresses = 2^(32−n)
- Usable hosts = Total addresses − 2 (network address and broadcast)
- Network address = first IP in the block
- Broadcast = last IP in the block
- First usable host = network + 1
- Last usable host = broadcast − 1

**Practice Example**

Given 192.168.10.0/26:
- Block size: 2^6 = 64 addresses
- Network: 192.168.10.0
- Broadcast: 192.168.10.63
- Usable: 192.168.10.1 – 192.168.10.62 (62 hosts)

Mastering these basics will make VLSM, routing protocols, and firewall ACLs much easier to understand.
    `,
  },
  {
    id: 2,
    slug: "vlsm-deep-dive",
    title: "VLSM Deep Dive: Efficient IP Address Allocation",
    category: "VLSM",
    badge: "badge-cyan",
    readTime: "10 min",
    date: "Apr 18, 2025",
    summary:
      "Variable Length Subnet Masking (VLSM) allows networks of different sizes within the same address space. Here's how to plan and implement it correctly.",
    content: `
Variable Length Subnet Masking (VLSM) is the answer to a simple problem: not every subnet needs the same number of hosts. FLSM wastes addresses; VLSM wastes nothing.

**The Core Principle**

VLSM lets you use different subnet masks within the same address block. A /30 for a point-to-point WAN link (2 hosts), a /26 for a medium office (62 hosts), and a /22 for a large campus (1022 hosts) — all carved from the same /20 parent.

**The Algorithm**

Always follow this order:
1. Sort requirements from largest to smallest
2. Allocate the largest subnet first
3. Move the pointer to the next available address after that block
4. Repeat for each subsequent subnet

**Why Largest First?**

Alignment. Large subnets must start on boundaries that are multiples of their block size. Starting with the biggest subnet guarantees you can fit it without fragmentation or overlap.

**Worked Example**

Parent: 10.10.0.0/20 (4096 addresses)

Requirements:
- Subnet A: 500 hosts → /23 (512 block)
- Subnet B: 200 hosts → /24 (256 block)
- Subnet C: 50 hosts → /26 (64 block)
- Subnet D: 2 hosts → /30 (4 block)

Allocation:
- A: 10.10.0.0/23 → uses 10.10.0.0–10.10.1.255
- B: 10.10.2.0/24 → uses 10.10.2.0–10.10.2.255
- C: 10.10.3.0/26 → uses 10.10.3.0–10.10.3.63
- D: 10.10.3.64/30 → uses 10.10.3.64–10.10.3.67

Total used: 836 addresses out of 4096, leaving significant space for future growth.

**VLSM in Practice**

VLSM requires classless routing protocols (RIP v2, OSPF, EIGRP, BGP) that carry subnet mask information in their routing updates. Classful protocols like RIPv1 cannot support VLSM.
    `,
  },
  {
    id: 3,
    slug: "cidr-explained",
    title: "CIDR Explained: Moving Beyond Classful Networking",
    category: "CIDR",
    badge: "badge-pink",
    readTime: "7 min",
    date: "Apr 25, 2025",
    summary:
      "Classful addressing wasted billions of IP addresses. CIDR changed everything. Understand how prefix notation works and why it's the foundation of modern routing.",
    content: `
Before 1993, the internet used classful addressing: Class A (8-bit prefix), Class B (16-bit), Class C (24-bit). If you needed 300 hosts, you got a Class B with 65,534 addresses — an enormous waste.

**Enter CIDR**

Classless Inter-Domain Routing (RFC 1519) broke this rigid system. Any prefix length from /0 to /32 became valid. A company needing 300 hosts could get a /23 (510 hosts) instead of a /16.

**How Prefix Notation Works**

A CIDR block like 203.0.113.0/25 means:
- The first 25 bits are fixed (the network portion)
- The last 7 bits are variable (host addresses)
- Block size = 2^7 = 128 addresses

**Supernetting / Route Aggregation**

CIDR also enables supernetting: combining multiple smaller networks into one route advertisement. Instead of advertising 256 individual /24 routes, an ISP can advertise a single /16 covering all of them. This shrinks global routing tables dramatically.

**Calculating CIDR Boundaries**

A key rule: a CIDR block must start on a boundary that is a multiple of its size.
- A /24 (256 addresses) must start at .0
- A /25 (128 addresses) must start at .0 or .128
- A /26 (64 addresses) must start at .0, .64, .128, or .192

Violating this rule causes overlapping or unrouteable blocks.

**CIDR and the Internet Today**

Every BGP router on the internet uses CIDR. The global routing table contains ~900,000 prefixes of varying lengths. Without CIDR, the internet's routing infrastructure would have collapsed under the weight of classful routes long ago.
    `,
  },
  {
    id: 4,
    slug: "private-ip-ranges",
    title: "Private IP Ranges and RFC 1918: What Every Engineer Should Know",
    category: "IP Addressing",
    badge: "badge-purple",
    readTime: "6 min",
    date: "May 2, 2025",
    summary:
      "RFC 1918 defines three private address ranges that power almost every LAN on earth. Learn the ranges, why they exist, and how NAT makes them work with the public internet.",
    content: `
The IPv4 address space was never large enough for every device on earth to have a public address. RFC 1918, published in 1996, solved this problem by designating three ranges as "private" — never routed on the public internet.

**The Three Private Ranges**

- **10.0.0.0/8** — Class A private space. Over 16 million addresses. Used by large enterprises and cloud providers for internal VPCs.
- **172.16.0.0/12** — 172.16.0.0 through 172.31.255.255. About 1 million addresses. Common in mid-sized organizations.
- **192.168.0.0/16** — 192.168.0.0 through 192.168.255.255. 65,536 addresses. The standard for home and small office networks.

**Why Private Addresses Work**

Routers on the public internet drop packets destined for RFC 1918 addresses. This provides a natural security boundary — a device with only a private IP is unreachable from the outside world without special configuration.

**NAT: The Bridge**

Network Address Translation (NAT) allows private-addressed devices to communicate with the internet. The NAT device (usually a router or firewall) replaces the private source IP with its public IP, tracks the mapping, and reverses the translation on return traffic.

**CGNAT and Shared Address Space**

RFC 6598 defined 100.64.0.0/10 as "Shared Address Space" for Carrier-Grade NAT (CGNAT). ISPs use this between their NAT devices and customer routers — you might see this range on the WAN interface of your home router.

**Other Special Ranges**

- 127.0.0.0/8 — Loopback (localhost)
- 169.254.0.0/16 — Link-local / APIPA (auto-assigned when DHCP fails)
- 224.0.0.0/4 — Multicast
- 240.0.0.0/4 — Reserved / Experimental
    `,
  },
  {
    id: 5,
    slug: "wildcard-masks-acl",
    title: "Wildcard Masks in ACLs: A Practical Guide",
    category: "Security",
    badge: "badge-orange",
    readTime: "9 min",
    date: "May 8, 2025",
    summary:
      "Wildcard masks are the inverse of subnet masks and are essential for writing Cisco ACLs and OSPF network statements. Master them with clear examples.",
    content: `
Wildcard masks trip up many network engineers because they work backwards from subnet masks. A 0 bit means "must match" and a 1 bit means "any value is OK."

**Wildcard vs. Subnet Mask**

Subnet mask 255.255.255.0 → Wildcard 0.0.0.255

To compute a wildcard mask: subtract the subnet mask from 255.255.255.255.
255.255.255.255 − 255.255.255.0 = 0.0.0.255

**Common Wildcards**

| CIDR | Subnet Mask | Wildcard |
|------|-------------|---------|
| /24 | 255.255.255.0 | 0.0.0.255 |
| /26 | 255.255.255.192 | 0.0.0.63 |
| /28 | 255.255.255.240 | 0.0.0.15 |
| /30 | 255.255.255.252 | 0.0.0.3 |

**Using Wildcards in Cisco ACLs**

To permit all traffic from 192.168.10.0/24:
\`permit ip 192.168.10.0 0.0.0.255 any\`

To permit traffic from only 10.0.0.0–10.0.3.255 (a /22):
\`permit ip 10.0.0.0 0.0.3.255 any\`

**Matching Non-Contiguous Bits**

Wildcards aren't limited to matching contiguous ranges. In OSPF, you might use:
\`network 10.0.0.0 0.255.255.255 area 0\` — matches any 10.x.x.x address.

Or to match only odd-numbered addresses in a range, you can use non-contiguous wildcards (though this is rare in practice).

**Special Cases**

- 0.0.0.0 wildcard → exact host match (equivalent to "host" keyword)
- 255.255.255.255 wildcard → matches any address (equivalent to "any" keyword)

**OSPF Network Statements**

OSPF uses wildcard masks in network statements to determine which interfaces to include in the OSPF process:
\`network 192.168.0.0 0.0.255.255 area 0\`
This includes all interfaces in the 192.168.0.0/16 range in area 0.
    `,
  },
  {
    id: 6,
    slug: "ipv6-transition",
    title: "IPv6 Subnetting: What's Different and What Stays the Same",
    category: "IPv6",
    badge: "badge-blue",
    readTime: "11 min",
    date: "May 14, 2025",
    summary:
      "IPv6 has 340 undecillion addresses. Subnetting works differently — and in many ways more simply. Here's what network engineers need to know when transitioning.",
    content: `
IPv6 uses 128-bit addresses instead of 32-bit, giving us 2^128 = 340,282,366,920,938,463,463,374,607,431,768,211,456 addresses. Subnetting this space requires a new mental model.

**IPv6 Address Structure**

A typical IPv6 address: 2001:0db8:85a3:0000:0000:8a2e:0370:7334

It's divided into:
- First 48 bits: Global Routing Prefix (assigned by ISP)
- Next 16 bits: Subnet ID (yours to manage)
- Last 64 bits: Interface Identifier (host portion)

This gives every /48 allocation 65,536 possible /64 subnets — each containing 2^64 host addresses.

**Why /64 Is Standard**

SLAAC (Stateless Address Autoconfiguration) requires a /64 prefix. The device generates its own 64-bit interface ID using EUI-64 or random generation. Even if you only need 10 hosts, you still use /64.

**Prefix Notation**

Works the same as IPv4 CIDR: 2001:db8::/32 means the first 32 bits are the network prefix.

**Subnetting a /48 into /64s**

If your ISP gives you 2001:db8:acad::/48, you have 16 bits to work with for subnets:
- 2001:db8:acad:0001::/64
- 2001:db8:acad:0002::/64
- ... up to 2001:db8:acad:ffff::/64

**No More NAT (Mostly)**

Every device can have a globally unique address. The security model shifts to firewalls rather than relying on NAT for isolation.

**Special Addresses**

- ::1/128 — Loopback
- fe80::/10 — Link-local (automatically assigned)
- ff00::/8 — Multicast
- 2000::/3 — Global unicast (public internet)

**Transition Mechanisms**

During the IPv4→IPv6 transition, several mechanisms help:
- Dual-stack: run both protocols simultaneously
- 6to4: encapsulate IPv6 in IPv4 packets
- ISATAP, Teredo: various tunneling approaches
- NAT64: translate between IPv6 and IPv4 at the border
    `,
  },
  {
    id: 7,
    slug: "ospf-areas-design",
    title: "OSPF Area Design and Summarization",
    category: "Routing",
    badge: "badge-cyan",
    readTime: "12 min",
    date: "May 20, 2025",
    summary:
      "OSPF area design directly impacts scalability and convergence time. Learn how to structure areas, use ABRs effectively, and summarize routes at area boundaries.",
    content: `
OSPF (Open Shortest Path First) is a link-state protocol that divides networks into areas to improve scalability. Good area design keeps the LSDB manageable and convergence fast.

**The Two-Level Hierarchy**

OSPF requires a two-level design:
- **Area 0 (Backbone)**: All other areas must connect to it, either directly or via virtual links.
- **Non-Backbone Areas**: Regular areas, stub areas, or NSSA.

**Why Multiple Areas?**

Each router in an area maintains a complete Link State Database (LSDB) for that area. A flat single-area OSPF domain with 500 routers means every router runs SPF against 500 nodes. Splitting into areas of 50 routers each reduces SPF complexity by 10x.

**Area Types**

- **Regular Area**: Receives all LSA types including external routes
- **Stub Area**: Blocks external LSAs, replaces with a default route. Reduces LSDB size.
- **Totally Stubby Area** (Cisco): Blocks inter-area and external LSAs. Only a default route.
- **NSSA** (Not So Stubby Area): Blocks external LSAs but allows the area's own ASBR to redistribute

**Route Summarization at ABRs**

This is where subnetting knowledge pays off directly. An ABR (Area Border Router) can summarize a range of subnets into a single advertisement to area 0.

Example: If you have 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24, and 10.1.4.0/24 in Area 1, the ABR can advertise 10.1.0.0/21 to the backbone — one LSA instead of four.

On Cisco IOS:
\`area 1 range 10.1.0.0 255.255.248.0\`

**Design Guidelines**

- Keep areas under 50-100 routers for optimal SPF performance
- Design IP addressing hierarchically so summarization is natural
- All inter-area traffic must transit area 0 — avoid sub-optimal paths
- Use stub areas wherever external routes are not needed
    `,
  },
  {
    id: 8,
    slug: "bgp-prefixes",
    title: "BGP Prefix Filtering and Route Aggregation",
    category: "BGP",
    badge: "badge-gold",
    readTime: "13 min",
    date: "May 26, 2025",
    summary:
      "BGP carries the internet's routing table. Learn how to filter, aggregate, and originate prefixes correctly — including how to avoid becoming a source of route leaks.",
    content: `
BGP (Border Gateway Protocol) is the routing protocol that runs the internet. Unlike OSPF, BGP is a path-vector protocol optimized for policy rather than speed. Understanding prefix handling is critical for any network connected to the public internet.

**Prefix Origination**

To advertise a prefix via BGP, the network must exist in the RIB (Routing Information Base):
\`network 203.0.113.0 mask 255.255.255.0\`

Or via redistribution:
\`redistribute static route-map ONLY_MY_PREFIXES\`

Always use route-maps and prefix-lists to control what gets redistributed.

**Aggregation / Summarization**

Instead of advertising specific /24s, aggregate into a shorter prefix:
\`aggregate-address 203.0.113.0 255.255.255.0 summary-only\`

The \`summary-only\` keyword suppresses the more-specific routes. Without it, both the aggregate and specifics are advertised — sometimes intentional for traffic engineering.

**Prefix Filtering**

Every BGP peer should have prefix filters applied:
\`ip prefix-list MY_PREFIXES permit 203.0.113.0/24\`
\`neighbor 198.51.100.1 prefix-list MY_PREFIXES out\`

This prevents accidentally leaking your customer's routes or internal prefixes to the internet.

**RPKI: Route Origin Validation**

RPKI (Resource Public Key Infrastructure) cryptographically validates that an AS is authorized to originate a prefix. A Route Origin Authorization (ROA) ties a prefix to an ASN. Routers can then reject INVALID routes (wrong AS originating a prefix).

**The Route Leak Problem**

A route leak occurs when a prefix received from one AS is incorrectly re-advertised to other ASes. Major incidents have caused significant internet outages. Proper prefix filtering and RPKI mitigate this risk.

**AS-Path Filtering**

Use AS-path filters to control inbound/outbound routing:
\`ip as-path access-list 1 permit ^$\` — matches routes originated by your own AS
\`ip as-path access-list 1 permit ^65001_\` — matches routes from AS 65001

**Community-Based Policy**

BGP communities allow tagging routes with metadata that peers use for policy decisions — like telling an upstream to set local preference or not re-advertise a prefix.
    `,
  },
  {
    id: 9,
    slug: "nat-types-explained",
    title: "NAT Types Explained: Static, Dynamic, PAT, and Beyond",
    category: "NAT",
    badge: "badge-orange",
    readTime: "8 min",
    date: "Jun 2, 2025",
    summary:
      "Network Address Translation comes in several flavors. Understanding each type — and its limitations — is essential for designing networks that work correctly with real applications.",
    content: `
NAT (Network Address Translation) has kept the internet running for decades despite IPv4 exhaustion. But NAT breaks the end-to-end connectivity model and creates challenges for applications that embed IP addresses.

**Static NAT (1:1)**

Maps a private IP permanently to a public IP. Used when an internal server must be consistently reachable from outside:
- Inside local: 192.168.1.10
- Inside global: 203.0.113.10

Every connection to 203.0.113.10 reaches 192.168.1.10. Good for web servers, mail servers.

**Dynamic NAT (Pool)**

Maps private IPs to a pool of public IPs on demand. If the pool has 10 addresses and all are in use, the 11th host cannot get internet access. Rare in modern networks.

**PAT / NAT Overload**

Port Address Translation (also called NAT Overload) maps many private IPs to a single public IP, distinguished by unique source port numbers. This is what your home router does.

Thousands of sessions can share one public IP by using different source ports (1024–65535). The NAT table tracks ip:port → publicIP:port mappings.

**Limitations of NAT**

1. **Breaks peer-to-peer**: NAT devices don't accept unsolicited inbound connections, making P2P applications harder.
2. **IPsec issues**: Encryption covers the transport header that NAT needs to modify. NAT-T (NAT Traversal) wraps IPsec in UDP port 4500.
3. **SIP/VoIP**: SIP embeds IP addresses in the payload. ALG (Application Layer Gateway) or STUN is needed.
4. **FTP**: Active FTP embeds the client IP in the PORT command. Passive FTP avoids this.

**Hairpin / NAT Reflection**

When an internal host tries to reach an internal server using its public IP, the router must support hairpin NAT — translating the destination back to the private IP for traffic staying inside the network.

**CGNAT (Carrier-Grade NAT)**

ISPs use CGNAT to share IPv4 addresses across customers. Your public IP from your ISP is actually private from the ISP's perspective (100.64.0.0/10). Double NAT creates additional issues for gaming, VPNs, and port forwarding.
    `,
  },
  {
    id: 10,
    slug: "network-design-principles",
    title: "Hierarchical Network Design: Core, Distribution, and Access",
    category: "Design",
    badge: "badge-purple",
    readTime: "10 min",
    date: "Jun 8, 2025",
    summary:
      "The three-layer hierarchical model is the foundation of scalable enterprise networks. Learn how it maps to IP addressing, subnetting strategy, and routing design.",
    content: `
The hierarchical network model divides a network into three distinct layers, each with a clear purpose. This model has guided enterprise network design for decades and remains foundational even in modern spine-leaf data center architectures.

**The Three Layers**

**Core Layer**
- Purpose: High-speed transport between distribution layers
- Devices: High-performance switches/routers
- Design principle: Speed and availability, no packet manipulation
- Routing: Summarized routes only, no specific host routes
- Do NOT: Apply ACLs, run DHCP, or connect end users

**Distribution Layer**
- Purpose: Policy, routing between VLANs, aggregation
- Devices: Multi-layer switches
- Functions: Inter-VLAN routing, route summarization toward core, QoS policy, ACLs
- Redundancy: Typically dual-homed to two core devices

**Access Layer**
- Purpose: End-device connectivity
- Devices: Layer 2 switches
- Functions: Port security, VLAN assignment, PoE, spanning tree
- One subnet per access switch (ideally)

**IP Addressing Strategy**

The hierarchy maps directly to IP addressing:
- Core links: /30 or /31 point-to-point
- Distribution layer: /24 management subnet per distribution block
- Access layer: one /24 or /25 per access switch for user VLANs
- Server subnets: dedicated /24 or /23 in a dedicated block

**Route Summarization at Each Layer**

- Access to Distribution: specific host routes (or /24s)
- Distribution to Core: summarized /16 or /22 per building/campus
- Core: only summary routes, default to internet

**Spine-Leaf: The Modern Evolution**

Data centers replaced three-tier with spine-leaf:
- Every leaf connects to every spine (full mesh)
- Predictable latency (always 1 or 2 hops)
- Horizontal scaling by adding spines or leaves
- BGP with private ASNs often used for routing

The addressing principles remain: summarize aggressively, design hierarchy first, then assign IPs.
    `,
  },
  {
    id: 11,
    slug: "vlans-and-subnets",
    title:
      "VLANs and Subnets: The Relationship Network Engineers Must Understand",
    category: "LAN Design",
    badge: "badge-cyan",
    readTime: "7 min",
    date: "Jun 15, 2025",
    summary:
      "VLANs and subnets are often confused. One is a Layer 2 concept, the other Layer 3 — but they work together. Learn the relationship and best practices for mapping them.",
    content: `
A common misconception: VLANs and subnets are the same thing. They're not — but they're deeply related. Understanding the distinction makes you a better network designer.

**VLANs: Layer 2 Segmentation**

A VLAN (Virtual LAN) is a logical group of switch ports that share the same broadcast domain, regardless of physical location. VLAN 10 might include ports on switch-A in building 1 and switch-B in building 2.

VLANs are configured on switches using 802.1Q tags. Trunk ports carry multiple VLANs between switches; access ports belong to a single VLAN.

**Subnets: Layer 3 Segmentation**

A subnet is an IP address range. Devices in the same subnet can communicate directly (Layer 2). Devices in different subnets need a router.

**The Relationship**

Best practice: one VLAN = one subnet. This keeps Layer 2 and Layer 3 boundaries aligned and makes troubleshooting straightforward.

- VLAN 10 → 192.168.10.0/24
- VLAN 20 → 192.168.20.0/24
- VLAN 30 → 192.168.30.0/24

**Inter-VLAN Routing**

For hosts in different VLANs to communicate, traffic must pass through a router (or a Layer 3 switch). Common approaches:

1. **Router-on-a-stick**: One physical link to a router with subinterfaces per VLAN (small networks)
2. **Layer 3 switch**: Switch with routing capability creates SVI (Switched Virtual Interface) per VLAN
3. **Distributed routing**: Route at the access layer (large data centers)

**SVI Configuration Example (Cisco)**
\`interface Vlan10\`
\`ip address 192.168.10.1 255.255.255.0\`
\`no shutdown\`

The SVI becomes the default gateway for hosts in that VLAN.

**Voice VLANs**

IP phones typically use a dedicated voice VLAN with its own subnet, separate from the data VLAN on the same port. QoS policies differentiate voice traffic from data.

**Mapping VLANs to OSPF Areas**

In larger networks, each OSPF area often corresponds to a physical site or distribution block, and all VLANs/subnets at that site are summarized at the area boundary.
    `,
  },
  {
    id: 12,
    slug: "network-troubleshooting",
    title: "Systematic Network Troubleshooting with Subnetting",
    category: "Troubleshooting",
    badge: "badge-pink",
    readTime: "9 min",
    date: "Jun 20, 2025",
    summary:
      "When packets don't flow, subnetting knowledge is your most powerful diagnostic tool. Here's a systematic methodology for isolating connectivity problems.",
    content: `
Most connectivity problems come down to one of three things: the wrong subnet mask, an incorrect default gateway, or a missing route. Systematic troubleshooting eliminates each possibility quickly.

**The OSI Approach**

Start at Layer 1 and work up, or start at Layer 7 and work down. For IP connectivity, starting at Layer 3 and reasoning about subnet boundaries is often fastest.

**Step 1: Verify the IP Configuration**

On the host:
- IP address correct?
- Subnet mask correct? A /24 instead of /25 means the host thinks it can reach twice the address space directly, causing packets to go out without the router.
- Default gateway correct? It must be in the same subnet as the host.

**The Wrong Mask Problem**

Suppose host A is 192.168.1.10/24 and host B is 192.168.1.200/24, but they're actually in different /25 subnets (A in 192.168.1.0/25, B in 192.168.1.128/25). With the /24 mask, both hosts think they're on the same subnet and try to ARP for each other directly instead of going through the router. Packets drop because the router isn't involved.

**Step 2: Test Layer 3 Reachability**

1. Ping the loopback (127.0.0.1) — verifies TCP/IP stack is functional
2. Ping the local IP — verifies NIC and IP binding
3. Ping the default gateway — verifies Layer 2 connectivity and routing on the local subnet
4. Ping a remote subnet — if this fails but gateway pings succeed, the problem is routing beyond the gateway

**Step 3: Trace the Path**

\`traceroute\` shows each hop. If it stops at a specific router, that router either has no route to the destination or a firewall is blocking return traffic.

**Step 4: Check Routing Tables**

On routers along the path, verify the route exists:
\`show ip route 10.5.3.0\`

Look for the longest-prefix match. A /8 route when a /24 should exist means a summarization or redistribution problem.

**Step 5: ACLs and Firewalls**

ACLs are stateless and can block return traffic even when outbound is permitted. Always check ACLs in both directions. Use \`show ip access-lists\` to see hit counters.

**Common Subnet-Related Mistakes**

1. Host and gateway in different subnets (gateway unreachable)
2. Duplicate IP addresses (ARP conflicts cause intermittent failures)
3. Overlapping subnets (routing table confusion)
4. Incorrect static route mask (traffic goes to wrong next-hop)
5. DHCP pool in wrong subnet (clients get IPs that don't match the VLAN)
    `,
  },
];

function ArticleModal({ article, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        overflowY: "auto",
        padding: "40px 16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          maxWidth: 760,
          width: "100%",
          padding: "40px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            color: "var(--text-muted)",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✕ Close
        </button>

        <div style={{ marginBottom: 8 }}>
          <span className={`badge ${article.badge}`}>{article.category}</span>
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.3,
            marginBottom: 12,
          }}
        >
          {article.title}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 28,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime} read</span>
        </div>

        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.9,
          }}
        >
          {article.content
            .trim()
            .split("\n\n")
            .map((para, i) => {
              if (
                para.startsWith("**") &&
                para.endsWith("**") &&
                !para.slice(2).includes("**")
              ) {
                return (
                  <h3
                    key={i}
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginTop: 24,
                      marginBottom: 8,
                    }}
                  >
                    {para.slice(2, -2)}
                  </h3>
                );
              }
              // Handle bold inline
              const formatted = para.replace(
                /\*\*(.*?)\*\*/g,
                '<strong style="color:var(--text-primary)">$1</strong>',
              );
              return (
                <p
                  key={i}
                  style={{ marginBottom: 14 }}
                  dangerouslySetInnerHTML={{ __html: formatted }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(ARTICLES.map((a) => a.category))),
  ];

  const filtered = ARTICLES.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      className="page-wrapper"
      style={{ background: "var(--bg-deep)", minHeight: "100vh" }}
    >
      <div className="bg-grid" />
      <div
        className="bg-glow-orb"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(250,189,47,0.07) 0%, transparent 70%)",
          top: -150,
          right: -150,
        }}
      />
      <NavBar />

      {selected && (
        <ArticleModal article={selected} onClose={() => setSelected(null)} />
      )}

      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div className="animate-fadeInUp" style={{ marginBottom: 40 }}>
          <div className="section-tag">Knowledge Base</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Networking Blog
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Deep-dives into subnetting, VLSM, CIDR, routing protocols, and
            modern network design.
          </p>
        </div>

        {/* Search */}
        <div
          className="animate-fadeInUp stagger-1"
          style={{ marginBottom: 24 }}
        >
          <input
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Category filter */}
        <div
          className="tab-bar animate-fadeInUp stagger-1"
          style={{ marginBottom: 32, flexWrap: "wrap" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((article, i) => (
            <div
              key={article.id}
              className={`card animate-fadeInUp stagger-${Math.min(i + 1, 4)}`}
              style={{
                padding: 28,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
              onClick={() => setSelected(article)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "rgba(250,189,47,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className={`badge ${article.badge}`}>
                  {article.category}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "DM Mono, monospace",
                  }}
                >
                  {article.readTime}
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  {article.title}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {article.summary}
                </p>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {article.date}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--gold)",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No articles match your search.
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          <Link
            to="/"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            ← Home
          </Link>
        </div>
      </div>

      <footer className="app-footer">
        Made with ♥ by{" "}
        <a
          href="https://github.com/hafiz-sakib"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohammad Hafizur Rahman Sakib
        </a>
      </footer>
    </div>
  );
}
