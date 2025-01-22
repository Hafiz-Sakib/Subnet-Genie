import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl mb-8">Subnet Calculator</h1>
      <div className="space-x-4">
        <Link href="/normal-subnet">
          <a className="bg-blue-500 text-white py-2 px-4 rounded">
            Normal Subnet Calculation
          </a>
        </Link>
        <Link href="/vlsm-subnet">
          <a className="bg-green-500 text-white py-2 px-4 rounded">
            VLSM Subnet Calculation
          </a>
        </Link>
      </div>
    </div>
  );
}
