// src/api/qloo.js
const QLOO_BASE = import.meta.env.VITE_QLOO_URL;
const QLOO_TOKEN = import.meta.env.VITE_QLOO_API_KEY;

// Helper function to search for entities by name
async function searchEntity(name, type) {
  try {
    const resp = await fetch(
      `${QLOO_BASE}/search?q=${encodeURIComponent(name)}&types=${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": QLOO_TOKEN,
        },
      }
    );

    if (!resp.ok) {
      console.warn(`Entity search failed for ${name}: ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    return data.results && data.results.length > 0 ? data.results[0].id : null;
  } catch (error) {
    console.warn(`Entity search error for ${name}:`, error);
    return null;
  }
}

export async function fetchTasteData(inputs) {
  try {
    console.log("Fetching taste data with inputs:", inputs);

    // Enhanced mapping for better travel recommendations
    const cuisineMapping = {
      italian: "urn:tag:cuisine:restaurant:italian",
      asian: "urn:tag:cuisine:restaurant:asian",
      mexican: "urn:tag:cuisine:restaurant:mexican",
      american: "urn:tag:cuisine:restaurant:american",
      french: "urn:tag:cuisine:restaurant:french",
      indian: "urn:tag:cuisine:restaurant:indian",
      mediterranean: "urn:tag:cuisine:restaurant:mediterranean",
      japanese: "urn:tag:cuisine:restaurant:japanese",
      thai: "urn:tag:cuisine:restaurant:thai",
      greek: "urn:tag:cuisine:restaurant:greek",
    };

    // Activity-based tags for places
    const activityMapping = {
      museums: "urn:tag:venue:museum",
      nightlife: "urn:tag:venue:nightlife",
      shopping: "urn:tag:venue:shopping",
      nature: "urn:tag:venue:outdoor",
      beach: "urn:tag:venue:beach",
      mountains: "urn:tag:venue:mountain",
    };

    let selectedTag = "urn:tag:cuisine:restaurant:italian"; // Default fallback
    let tagSource = "default";

    // Priority 1: Check food preferences (most reliable for place recommendations)
    const foodInput = inputs.find(
      (input) => input.type === "food" && input.value
    );
    if (foodInput) {
      const foodValue = foodInput.value.toLowerCase();
      for (const [key, tag] of Object.entries(cuisineMapping)) {
        if (foodValue.includes(key)) {
          selectedTag = tag;
          tagSource = "food";
          break;
        }
      }
    }

    // Priority 2: Check activities if no food match
    if (tagSource === "default") {
      const activitiesInput = inputs.find(
        (input) => input.type === "activities" && input.value
      );
      if (activitiesInput) {
        const activitiesValue = activitiesInput.value.toLowerCase();
        for (const [key, tag] of Object.entries(activityMapping)) {
          if (activitiesValue.includes(key)) {
            selectedTag = tag;
            tagSource = "activities";
            break;
          }
        }
      }
    }

    // Priority 3: Check interests for cultural preferences
    if (tagSource === "default") {
      const interestsInput = inputs.find(
        (input) => input.type === "interests" && input.value
      );
      if (interestsInput) {
        const interestsValue = interestsInput.value.toLowerCase();
        if (
          interestsValue.includes("art") ||
          interestsValue.includes("culture")
        ) {
          selectedTag = "urn:tag:venue:museum";
          tagSource = "interests";
        } else if (
          interestsValue.includes("food") ||
          interestsValue.includes("wine")
        ) {
          selectedTag = "urn:tag:cuisine:restaurant:italian";
          tagSource = "interests";
        }
      }
    }

    console.log(`Using tag: ${selectedTag} (source: ${tagSource})`);

    const params = new URLSearchParams({
      "filter.type": "urn:entity:place",
      "filter.tags": selectedTag,
      limit: "10",
    });

    console.log("Making request with params:", params.toString());

    const resp = await fetch(`${QLOO_BASE}/v2/insights?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-Api-Key": QLOO_TOKEN,
      },
    });

    console.log("Response status:", resp.status);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("API Error Response:", errorText);

      // Fallback to our known working tag
      console.log("Fallback to Italian cuisine...");
      const fallbackParams = new URLSearchParams({
        "filter.type": "urn:entity:place",
        "filter.tags": "urn:tag:cuisine:restaurant:italian",
        limit: "10",
      });

      const fallbackResp = await fetch(
        `${QLOO_BASE}/v2/insights?${fallbackParams.toString()}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": QLOO_TOKEN,
          },
        }
      );

      if (fallbackResp.ok) {
        const fallbackData = await fallbackResp.json();
        console.log("Fallback successful! API Response:", fallbackData);
        return {
          ...fallbackData,
          message: "Found great restaurant and place recommendations!",
          userTastes: inputs.reduce((acc, input) => {
            acc[input.type] = input.value;
            return acc;
          }, {}),
          tagSource: "fallback",
        };
      }

      throw new Error(`Qloo API error: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json();
    console.log("Success! API Response:", data);

    // Create personalized message based on what matched
    let message =
      "Found personalized place recommendations based on your tastes!";
    if (tagSource === "food") {
      message = `Found great ${foodInput.value} restaurants and related places!`;
    } else if (tagSource === "activities") {
      const activitiesInput = inputs.find(
        (input) => input.type === "activities"
      );
      message = `Found places perfect for ${activitiesInput.value.toLowerCase()} activities!`;
    } else if (tagSource === "interests") {
      const interestsInput = inputs.find((input) => input.type === "interests");
      message = `Found destinations matching your interest in ${interestsInput.value.toLowerCase()}!`;
    }

    // Enhance the response with user context
    return {
      ...data,
      message: message,
      userTastes: inputs.reduce((acc, input) => {
        acc[input.type] = input.value;
        return acc;
      }, {}),
      selectedTag: selectedTag,
      tagSource: tagSource,
    };
  } catch (error) {
    console.error("fetchTasteData error:", error);

    // Return mock data with user's taste inputs preserved
    return {
      success: false,
      results: [],
      message: "API connection issue - using offline mode",
      tastes: inputs.reduce((acc, input) => {
        acc[input.type] = input.value;
        return acc;
      }, {}),
    };
  }
}
