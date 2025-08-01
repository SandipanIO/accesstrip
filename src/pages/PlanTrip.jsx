import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PlanTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, tastes, tasteData } = location.state;

  const [tripType, setTripType] = useState("short");
  const [duration, setDuration] = useState(4);
  const [experience, setExperience] = useState("");
  const [budget, setBudget] = useState("");
  const [destination, setDestination] = useState("");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const destinationSuggestions = [
    "London, UK",
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Barcelona, Spain",
    "Amsterdam, Netherlands",
    "Berlin, Germany",
    "Rome, Italy",
    "Sydney, Australia",
    "Toronto, Canada",
    "Singapore",
    "Dubai, UAE",
    "Bangkok, Thailand",
    "Mumbai, India",
    "São Paulo, Brazil",
    "Mexico City, Mexico",
    "Cairo, Egypt",
    "Stockholm, Sweden",
  ];

  const handleSubmit = () => {
    if (!destination.trim() || !experience.trim()) {
      alert("Please fill out destination and experience fields");
      return;
    }

    navigate("/results", {
      state: {
        name,
        tastes,
        tasteData,
        destination: destination.trim(),
        tripType,
        duration,
        experience: experience.trim(),
        budget,
        accessibilityNeeds,
      },
    });
  };

  const handleAccessibilityChange = (need) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(need)
        ? prev.filter((item) => item !== need)
        : [...prev, need]
    );
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🧳 Hey {name}, let's plan your trip!
      </h1>

      {/* Show user's taste summary */}
      <div className="bg-blue-50 p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Your Preferences:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-blue-700">
          {Object.entries(tastes)
            .filter(([_, value]) => value)
            .map(([key, value]) => (
              <div key={key} className="bg-white p-2 border">
                <span className="capitalize font-medium block">{key}:</span>
                <span className="text-xs">{value}</span>
              </div>
            ))}
        </div>
        {tasteData?.message && (
          <p className="text-xs text-blue-600 mt-2 italic">
            {tasteData.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination *
          </label>
          <input
            type="text"
            placeholder="Enter City or Country"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setShowDestinationSuggestions(true)}
            onBlur={() =>
              setTimeout(() => setShowDestinationSuggestions(false), 200)
            }
            className="w-full border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          {showDestinationSuggestions && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 shadow-lg z-50 max-h-40 overflow-y-auto">
              {destinationSuggestions
                .filter((place) =>
                  place.toLowerCase().includes(destination.toLowerCase())
                )
                .map((place, i) => (
                  <li
                    key={i}
                    onMouseDown={() => {
                      setDestination(place);
                      setShowDestinationSuggestions(false);
                    }}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm"
                  >
                    {place}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Duration
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="short"
                checked={tripType === "short"}
                onChange={() => setTripType("short")}
                className="text-green-600"
              />
              Short Trip (1-3 days)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="long"
                checked={tripType === "long"}
                onChange={() => setTripType("long")}
                className="text-green-600"
              />
              Long Trip (4+ days)
            </label>
          </div>
        </div>

        {tripType === "long" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Days
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {[4, 5, 6, 7, 8, 9, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d} Day{d > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What kind of experience are you looking for? *
          </label>
          <input
            type="text"
            placeholder="e.g., Relaxing vacation, Adventure-packed trip, Cultural exploration"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Range (optional)
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select budget range</option>
            <option value="budget">Budget ($50-100/day)</option>
            <option value="mid-range">Mid-range ($100-200/day)</option>
            <option value="luxury">Luxury ($200+/day)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Accessibility Needs (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Wheelchair accessible",
              "Minimal walking",
              "Elevator access",
              "Accessible parking",
              "Minimal stairs",
              "Audio descriptions",
              "Sign language services",
              "Accessible restrooms",
              "Ramps available",
              "Wide doorways",
            ].map((need) => (
              <label key={need} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.includes(need)}
                  onChange={() => handleAccessibilityChange(need)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">{need}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!destination || !experience}
          className="w-full bg-green-600 text-white py-3 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate My Personalized Trip! 🚀
        </button>
      </div>
    </div>
  );
}
