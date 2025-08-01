import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Welcome() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name to continue.");
      return;
    }
    navigate("/taste", { state: { name: name.trim() } });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to AccessTrip</h1>
      <p className="mb-8 text-lg text-gray-600">
        Explore the world with your vibe and your needs in mind.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder="What's your name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-3 hover:bg-green-700 transition-all"
        >
          Plan Your Trip →
        </button>
      </form>
    </div>
  );
}
