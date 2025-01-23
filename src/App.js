import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <div className="text-center space-y-6 bg-white bg-opacity-10 p-8 rounded-lg shadow-xl backdrop-blur-lg">
        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">
          Subnet Calculator
        </h1>
        <p className="text-lg font-light">Choose the calculation type below:</p>
        <div className="space-y-4">
          <Link
            to="/normal-subnet"
            className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            FLSM Subnet Calculation
          </Link>
          <Link
            to="/vlsm-subnet"
            className="block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            VLSM Subnet Calculation
          </Link>
        </div>
      </div>
      <footer className="mt-10 text-center text-sm bg-black bg-opacity-20 p-4 rounded-lg shadow-md">
        <div className="font-medium">
          Made with ❤️ by
          <a
            href="https://github.com/hafiz-sakib"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-300 hover:text-blue-500 underline transition-all"
          >
            Mohammad Hafizur Rahman Sakib
          </a>
        </div>
        <div className="mt-2 text-xs">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Default export for the component
export default App;
