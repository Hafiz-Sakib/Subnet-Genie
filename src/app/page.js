import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Subnetting Web App</h1>
      <nav>
        <Link href="/normal-subnet">Normal Subnet Calculation</Link>
        <Link href="/vlsm-subnet">VLSM Subnet Calculation</Link>
      </nav>
    </div>
  );
}
