import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchTasteData } from "../api/qloo";

const suggestions = {
  music: [
    "Jazz",
    "Hip Hop",
    "Classical",
    "Rock",
    "EDM",
    "Indie",
    "Pop",
    "Country",
    "R&B",
    "Electronic",
  ],
  food: [
    "Italian",
    "Asian",
    "Mexican",
    "American",
    "French",
    "Indian",
    "Mediterranean",
    "Japanese",
    "Thai",
    "Greek",
  ],
  activities: [
    "Museums",
    "Nightlife",
    "Shopping",
    "Nature",
    "Adventure Sports",
    "Cultural Sites",
    "Beach",
    "Mountains",
    "Art Galleries",
    "Local Markets",
  ],
  accommodation: [
    "Luxury Hotels",
    "Boutique Hotels",
    "Budget Hostels",
    "Vacation Rentals",
    "B&B",
    "Resorts",
  ],
  interests: [
    "History",
    "Art",
    "Technology",
    "Sports",
    "Food & Wine",
    "Photography",
    "Architecture",
    "Local Culture",
    "Entertainment",
    "Wellness",
  ],
};

export default function TasteInput() {
  const location = useLocation();
  const navigate = useNavigate();
  const name = location?.state?.name || "Traveler";

  const [tastes, setTastes] = useState({
    music: "",
    food: "",
    activities: "",
    accommodation: "",
    interests: "",
  });

  const [focusKey, setFocusKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTastes((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectSuggestion = (key, value) => {
    setTastes((prev) => ({ ...prev, [key]: value }));
    setFocusKey("");
  };

  const handleNext = async () => {
    // Basic validation
    const filledFields = Object.values(tastes).filter((value) => value.trim());
    if (filledFields.length === 0) {
      alert("Please fill in at least one preference to continue.");
      return;
    }

    setLoading(true);
    try {
      const inputs = Object.entries(tastes).map(([type, value]) => ({
        type,
        value,
      }));
      const tasteData = await fetchTasteData(inputs);

      // Check if we got valid data (even if it's fallback data)
      if (tasteData) {
        navigate("/plan", { state: { name, tastes, tasteData } });
      } else {
        alert("Unable to fetch recommendations. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        🎯 Let's capture your taste, {name}
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Tell us about your preferences to get personalized travel
        recommendations
      </p>
      <div className="space-y-4 relative z-10">
        {Object.entries(tastes).map(([key, value]) => (
          <div key={key} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {key === "activities"
                ? "Preferred Activities"
                : key === "accommodation"
                ? "Accommodation Style"
                : key === "interests"
                ? "Main Interests"
                : `Favorite ${key}`}
            </label>
            <input
              type="text"
              name={key}
              value={value}
              placeholder={
                key === "music"
                  ? "e.g., Jazz, Rock, Electronic"
                  : key === "food"
                  ? "e.g., Italian, Asian, Mediterranean"
                  : key === "activities"
                  ? "e.g., Museums, Nightlife, Nature"
                  : key === "accommodation"
                  ? "e.g., Boutique Hotels, B&B"
                  : key === "interests"
                  ? "e.g., History, Art, Local Culture"
                  : `Your favorite ${key}`
              }
              onFocus={() => setFocusKey(key)}
              onBlur={() => setTimeout(() => setFocusKey(""), 200)}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoComplete="off"
            />
            {focusKey === key && (
              <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 shadow-lg z-50 max-h-40 overflow-y-auto">
                {suggestions[key]
                  .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
                  .map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={() => selectSuggestion(key, s)}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm"
                    >
                      {s}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ))}
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Discovering your taste…" : "Next"}
        </button>
      </div>
    </div>
  );
}
