"use client"; // Marking the component as a client component

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-xl">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          Subnetting Web App
        </h1>
        <nav className="space-y-6">
          <Link
            href="/normal-subnet"
            className="block text-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Normal Subnet Calculation
          </Link>
          <Link
            href="/vlsm-subnet"
            className="block text-lg font-semibold text-white bg-green-500 hover:bg-green-600 py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            VLSM Subnet Calculation
          </Link>
        </nav>
      </div>
    </div>
  );
}
