const InputForm = ({ onSubmit }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    onSubmit({
      baseIP: data.get("baseIP"),
      mask: Number(data.get("mask")),
      subnets: Number(data.get("subnets")),
      hostRequirements: data.get("hostRequirements").split(",").map(Number),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-700">
        Subnet Calculator
      </h2>
      <p className="text-sm text-gray-500 text-center">
        Enter your details below to calculate subnet allocations.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base IP Address
        </label>
        <input
          name="baseIP"
          type="text"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="e.g., 192.168.1.0"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subnet Mask (CIDR)
        </label>
        <input
          name="mask"
          type="number"
          min="0"
          max="32"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="e.g., 24"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Subnets
        </label>
        <input
          name="subnets"
          type="number"
          min="1"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="e.g., 3"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Host Requirements (comma-separated)
        </label>
        <input
          name="hostRequirements"
          type="text"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="e.g., 50,100,200"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
      >
        Calculate
      </button>
    </form>
  );
};

export default InputForm;
