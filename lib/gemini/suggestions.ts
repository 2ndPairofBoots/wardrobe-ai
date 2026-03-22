import { getGeminiModel } from "./client";

type WardrobeSuggestionInputItem = {
  id: string;
  name: string;
  category: string;
  occasion_tags: string[];
  season_tags: string[];
};

type WeatherInput = {
  tempC: number;
  conditions: string;
};

type OutfitSuggestion = {
  name: string;
  item_ids: string[];
  reasoning: string;
};

export type ShoppingSuggestion = {
  item_name: string;
  reason: string;
  search_term: string;
  category: "tops" | "bottoms" | "shoes" | "outerwear" | "accessories";
  affiliate_url: string | null;
};

type OutfitSuggestionsInput = {
  wardrobeItems: WardrobeSuggestionInputItem[];
  weather: WeatherInput;
  stylePreferences: string[];
  occasion?: string;
};

type ShoppingSuggestionsInput = {
  wardrobeSummary: string;
  bodyType: string;
  fitNotes: string[];
  stylePreferences: string[];
  currentSeason: string;
};

const SYSTEM_PROMPT = `You are a personal stylist AI. Suggest outfit combinations using only items from the user's wardrobe.
Respond with valid JSON only — no markdown, no explanation.
Never suggest items not present in the wardrobe list provided.`;

const SHOPPING_SYSTEM_PROMPT = `You are a personal shopping advisor. Identify gaps in the user's wardrobe and suggest specific items to buy.
Base suggestions on their body type, fit notes, style preferences, and what they're currently missing.
Respond with valid JSON only — no markdown, no explanation.`;

function buildUserPrompt({
  wardrobeItems,
  weather,
  stylePreferences,
  occasion,
}: OutfitSuggestionsInput): string {
  return `Wardrobe: ${JSON.stringify(wardrobeItems)}
Weather: ${weather.tempC}°C, ${weather.conditions}
Style preferences: ${JSON.stringify(stylePreferences)}
Occasion (optional): ${occasion ?? ""}

Suggest 3 outfit combinations. Return JSON array:
[
  {
    "name": "outfit name",
    "item_ids": ["uuid", "uuid", "uuid"],
    "reasoning": "brief explanation why this works for the weather/occasion"
  }
]`;
}

function parseSuggestions(rawText: string): OutfitSuggestion[] {
  const parsed = JSON.parse(rawText) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid suggestions response format.");
  }

  return parsed.map((entry) => {
    const value = entry as Record<string, unknown>;
    return {
      name: String(value.name ?? ""),
      item_ids: Array.isArray(value.item_ids) ? value.item_ids.map((id) => String(id)) : [],
      reasoning: String(value.reasoning ?? ""),
    };
  });
}

function buildShoppingUserPrompt({
  wardrobeSummary,
  bodyType,
  fitNotes,
  stylePreferences,
  currentSeason,
}: ShoppingSuggestionsInput): string {
  return `Current wardrobe summary: ${wardrobeSummary}
Body type: ${bodyType}
Fit notes: ${JSON.stringify(fitNotes)}
Style preferences: ${JSON.stringify(stylePreferences)}
Current season: ${currentSeason}

Suggest 6-8 items to fill wardrobe gaps. Return JSON array:
[
  {
    "item_name": "specific item name",
    "reason": "why this fills a gap or suits their body/style",
    "search_term": "Amazon-optimized search string for this item",
    "category": "tops | bottoms | shoes | outerwear | accessories"
  }
]`;
}

function parseShoppingSuggestions(rawText: string): Omit<ShoppingSuggestion, "affiliate_url">[] {
  const parsed = JSON.parse(rawText) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid shopping suggestions response format.");
  }

  return parsed.map((entry) => {
    const value = entry as Record<string, unknown>;
    return {
      item_name: String(value.item_name ?? ""),
      reason: String(value.reason ?? ""),
      search_term: String(value.search_term ?? ""),
      category: String(value.category ?? "") as ShoppingSuggestion["category"],
    };
  });
}

export async function getOutfitSuggestions(input: OutfitSuggestionsInput): Promise<OutfitSuggestion[]> {
  const model = getGeminiModel();
  const userPrompt = buildUserPrompt(input);
  const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  try {
    let result = await model.generateContent(prompt);
    let text = result.response.text();
    let suggestions: OutfitSuggestion[];

    try {
      suggestions = parseSuggestions(text);
    } catch {
      result = await model.generateContent(prompt);
      text = result.response.text();
      suggestions = parseSuggestions(text);
    }

    const validItemIds = new Set(input.wardrobeItems.map((item) => item.id));

    return suggestions.filter((suggestion) => suggestion.item_ids.every((itemId) => validItemIds.has(itemId)));
  } catch {
    throw new Error("Unable to generate outfit suggestions.");
  }
}

export async function getShoppingSuggestions(
  input: ShoppingSuggestionsInput
): Promise<ShoppingSuggestion[]> {
  const model = getGeminiModel();
  const userPrompt = buildShoppingUserPrompt(input);
  const prompt = `${SHOPPING_SYSTEM_PROMPT}\n\n${userPrompt}`;

  try {
    let result = await model.generateContent(prompt);
    let text = result.response.text();
    let suggestions: Omit<ShoppingSuggestion, "affiliate_url">[];

    try {
      suggestions = parseShoppingSuggestions(text);
    } catch {
      result = await model.generateContent(prompt);
      text = result.response.text();
      suggestions = parseShoppingSuggestions(text);
    }

    const affiliateTag = process.env.AMAZON_AFFILIATE_TAG;

    return suggestions.map((item) => ({
      ...item,
      affiliate_url: affiliateTag
        ? `https://www.amazon.com/s?k=${encodeURIComponent(item.search_term)}&tag=${affiliateTag}`
        : null,
    }));
  } catch {
    throw new Error("Unable to generate shopping suggestions.");
  }
}
