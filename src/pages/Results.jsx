import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateTripRecommendations } from "../api/gemini";

function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const formatItinerary = (text) => {
    if (!text) return "";

    return (
      text
        // Convert ## headings to styled h2
        .replace(
          /^## (.*$)/gm,
          '<h2 class="text-2xl font-bold text-green-700 mb-4 mt-6 border-b-2 border-green-200 pb-2">$1</h2>'
        )
        // Convert ** bold text to styled spans
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-gray-900">$1</strong>'
        )
        // Convert * bullet points to styled list items
        .replace(
          /^\* (.*$)/gm,
          '<li class="ml-4 mb-2 flex items-start"><span class="text-green-600 mr-2">•</span><span>$1</span></li>'
        )
        // Convert numbered lists
        .replace(
          /^(\d+)\. (.*$)/gm,
          '<div class="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-400"><h3 class="font-semibold text-blue-800 mb-2">$1. $2</h3></div>'
        )
        // Convert accessibility symbols
        .replace(/♿/g, '<span class="text-blue-600 font-bold">♿</span>')
        // Convert emojis to bigger size
        .replace(
          /(🎵|🍽️|🎯|🏨|🎨|💰|🚗|📍|🔄|🌟|🇬🇧|🇺🇸|🎶|🏛️|✈️)/g,
          '<span class="text-xl">$1</span>'
        )
        // Convert line breaks to proper spacing
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/\n/g, "<br>")
        // Wrap in paragraph tags
        .replace(/^(.*)/, '<p class="mb-4">$1</p>')
    );
  };

  const {
    name,
    tastes,
    tasteData,
    destination,
    tripType,
    duration,
    experience,
    budget,
    accessibilityNeeds,
  } = state || {};

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    generateRecommendations();
  }, [state]);

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateTripRecommendations({
        name,
        tastes,
        tasteData,
        destination,
        tripType,
        duration,
        experience,
        budget,
        accessibilityNeeds,
      });

      setRecommendation(result);

      // If we got a result (even fallback), we should not show an error
      if (result && (result.success || result.fallbackItinerary)) {
        setError(null);
      } else {
        setError("Unable to generate recommendations. Please try again.");
      }
    } catch (err) {
      setError("Failed to generate recommendations. Please try again.");
      console.error("Error generating recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handlePlanAnother = () => {
    navigate("/plan", { state: { name, tastes, tasteData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Planning your trip...</h2>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-lg text-gray-500 mt-4">
            Creating your personalized itinerary for {destination} ✨
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This may take a few moments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-red-600">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={generateRecommendations}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          🎉 Your Personalized Trip to {destination}!
        </h2>
        <div className="flex justify-center space-x-4 text-sm text-gray-600">
          <span>👤 {name}</span>
          <span>
            📅 {tripType === "long" ? `${duration} days` : "1-3 days"}
          </span>
          {budget && <span>💰 {budget}</span>}
          {accessibilityNeeds && accessibilityNeeds.length > 0 && (
            <span>♿ {accessibilityNeeds.length} accessibility needs</span>
          )}
        </div>
      </div>

      {/* Trip Preferences Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl mb-8">
        <h3 className="font-semibold text-gray-800 mb-3">
          🎯 Your Preferences:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {Object.entries(tastes)
            .filter(([_, value]) => value)
            .map(([key, value]) => (
              <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="font-medium text-gray-700 capitalize">
                  {key}:
                </div>
                <div className="text-gray-600 mt-1">{value}</div>
              </div>
            ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <strong>Experience Goal:</strong> {experience}
        </div>
        {accessibilityNeeds && accessibilityNeeds.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              ♿ Accessibility Requirements:
            </h4>
            <div className="flex flex-wrap gap-2">
              {accessibilityNeeds.map((need, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Generated Itinerary */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">✈️</span>
            Your Personalized Accessible Travel Guide
          </h2>
        </div>
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            {recommendation?.success ? (
              <div
                className="text-gray-800 leading-relaxed space-y-4 itinerary-content"
                dangerouslySetInnerHTML={{
                  __html: formatItinerary(recommendation.itinerary),
                }}
              />
            ) : (
              <div
                className="text-gray-800 leading-relaxed space-y-4 itinerary-content"
                dangerouslySetInnerHTML={{
                  __html: formatItinerary(
                    recommendation?.fallbackItinerary ||
                      "No recommendations available"
                  ),
                }}
              />
            )}
          </div>
        </div>

        {!recommendation?.success && recommendation?.fallbackItinerary && (
          <div className="mx-8 mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ This is a basic itinerary based on your preferences.{" "}
              {recommendation?.error?.includes("API key")
                ? "To get AI-powered personalized recommendations, please ensure your Gemini API key is properly configured."
                : "The AI service is currently unavailable, but we've created a personalized itinerary based on your tastes and accessibility needs."}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlanAnother}
            className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition"
          >
            🗺️ Plan Another Destination
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            🔁 Start Over
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default Results;
