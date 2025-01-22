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
      className="space-y-4 p-6 bg-gray-100 rounded-md"
    >
      <div>
        <label className="block text-sm font-medium">Base IP Address</label>
        <input
          name="baseIP"
          type="text"
          className="w-full border p-2 rounded"
          placeholder="e.g., 192.168.1.0"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Subnet Mask (CIDR)</label>
        <input
          name="mask"
          type="number"
          min="0"
          max="32"
          className="w-full border p-2 rounded"
          placeholder="e.g., 24"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Number of Subnets</label>
        <input
          name="subnets"
          type="number"
          min="1"
          className="w-full border p-2 rounded"
          placeholder="e.g., 3"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          Host Requirements (comma-separated)
        </label>
        <input
          name="hostRequirements"
          type="text"
          className="w-full border p-2 rounded"
          placeholder="e.g., 50,100,200"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Calculate
      </button>
    </form>
  );
};

export default InputForm;
