// Gemini API integration for travel recommendations

export async function generateTripRecommendations(tripData) {
  const {
    name,
    tastes,
    tasteData,
    destination,
    tripType,
    duration,
    experience,
    budget,
    accessibilityNeeds = [],
  } = tripData;

  // Build a comprehensive prompt based on user preferences
  const prompt = `Create a detailed accessible travel itinerary for ${name} visiting ${destination}.

USER PREFERENCES:
- Music: ${tastes.music || "Not specified"}
- Food: ${tastes.food || "Not specified"}
- Activities: ${tastes.activities || "Not specified"}
- Accommodation: ${tastes.accommodation || "Not specified"}
- Interests: ${tastes.interests || "Not specified"}

TRIP DETAILS:
- Trip Type: ${tripType} trip
- Duration: ${tripType === "long" ? duration : "1-3"} days
- Experience Desired: ${experience}
- Budget: ${budget || "Not specified"}

ACCESSIBILITY REQUIREMENTS:
${
  accessibilityNeeds.length > 0
    ? accessibilityNeeds.map((need) => `- ${need}`).join("\n")
    : "- No specific accessibility requirements mentioned"
}

${tasteData?.message ? `Additional Context: ${tasteData.message}` : ""}

IMPORTANT: This trip must be fully accessible and accommodate all the listed accessibility needs. Please provide:

1. A personalized welcome message mentioning their specific preferences and accessibility considerations
2. Daily itinerary with fully accessible activities that match their tastes
3. Accessible restaurant recommendations based on their food preferences
4. Accessible accommodation suggestions with detailed accessibility features
5. Accessible attractions and activities that align with their interests
6. Accessible music venues or events if they specified music preferences
7. Budget-conscious accessible options if budget was mentioned
8. Detailed accessibility information for each recommendation (parking, entrances, restrooms, etc.)
9. Transportation options that accommodate their accessibility needs
10. Alternative accessible options for each recommendation

Format the response as a detailed, engaging accessible travel guide. Use emojis and friendly language. Always mention specific accessibility features for each recommendation.`;

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Gemini API Key exists:", !!apiKey);

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.log("No valid Gemini API key, using fallback");
      // Return fallback if no API key
      return {
        success: false,
        error: "No Gemini API key configured",
        fallbackItinerary: generateFallbackItinerary(tripData),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Response:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API Response:", data);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        success: true,
        itinerary: data.candidates[0].content.parts[0].text,
        generatedAt: new Date().toISOString(),
      };
    } else {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error generating trip recommendations:", error);

    // Fallback recommendation based on user data
    return {
      success: false,
      error: error.message,
      fallbackItinerary: generateFallbackItinerary(tripData),
    };
  }
}

function generateFallbackItinerary(tripData) {
  const {
    name,
    tastes,
    destination,
    tripType,
    duration,
    experience,
    budget,
    accessibilityNeeds = [],
  } = tripData;

  return `🌟 Accessible Trip Plan for ${name} to ${destination}

Hi ${name}! Here's your customized accessible ${tripType} trip itinerary:

🎵 Music: ${
    tastes.music
      ? `Since you love ${tastes.music}, I'll include accessible music venues and events featuring this genre.`
      : "I'll include accessible local music spots!"
  }

🍽️ Food: ${
    tastes.food
      ? `With your preference for ${tastes.food} cuisine, I've selected accessible restaurants that specialize in this.`
      : "I'll recommend diverse accessible local cuisine options."
  }

🎯 Activities: ${
    tastes.activities
      ? `Perfect accessible matches for your interest in ${tastes.activities}!`
      : "I'll include a variety of accessible engaging activities."
  }

🏨 Accommodation: ${
    tastes.accommodation
      ? `I've found accessible ${tastes.accommodation} options that suit your style.`
      : "I'll suggest comfortable accessible accommodation options."
  }

🎨 Interests: ${
    tastes.interests
      ? `Your passion for ${tastes.interests} will be well-served with these accessible recommendations.`
      : "I'll include diverse accessible cultural and recreational options."
  }

♿ Accessibility Features: ${
    accessibilityNeeds.length > 0
      ? `All recommendations will include: ${accessibilityNeeds.join(", ")}`
      : "All recommendations will be checked for general accessibility features."
  }

💰 Budget: ${
    budget
      ? `Focusing on ${budget} accessible options`
      : "Accessible options across various price ranges"
  }

🎯 Experience Focus: ${experience}

${
  tripType === "long"
    ? `Accessible day-by-day itinerary for ${duration} days:`
    : "Accessible short trip highlights:"
}

DAY 1: Arrival & Accessible Exploration
🏨 Check into accessible accommodation with all required accessibility features
🍽️ Welcome dinner at accessible restaurant featuring ${
    tastes.food || "local"
  } cuisine
🎯 Accessible ${tastes.activities || "sightseeing"} activity

${
  tripType === "long" && duration > 1
    ? `
DAY 2: Culture & Entertainment
🎨 Accessible ${tastes.interests || "cultural"} attractions
🎵 Accessible ${tastes.music || "local"} music venue or performance
🍽️ Accessible lunch spot

DAY 3${
        duration > 3
          ? `+: Extended Exploration
🎯 Additional accessible ${
              tastes.activities || "activities"
            } based on preferences
🏛️ Accessible museums or galleries
🌟 Accessible unique local experiences`
          : `: Departure Day
🛍️ Accessible souvenir shopping
✈️ Departure preparations`
      }`
    : ""
}

🚗 Transportation: All transportation options will accommodate your accessibility needs
📍 Emergency accessible facilities information provided
🔄 Flexible itinerary allowing for rest and accessibility considerations

This is a fallback itinerary. For AI-powered personalized recommendations, please add your Gemini API key to the environment variables.`;
}
