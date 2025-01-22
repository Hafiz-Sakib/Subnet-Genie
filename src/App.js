import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Subnet Calculator</h1>
        <div>
          <Link to="/normal-subnet" className="text-blue-500 hover:underline">
            Normal Subnet Calculation
          </Link>
        </div>
        <div>
          <Link to="/vlsm-subnet" className="text-blue-500 hover:underline">
            VLSM Subnet Calculation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
