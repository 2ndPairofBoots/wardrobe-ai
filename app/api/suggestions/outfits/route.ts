import { NextResponse } from "next/server";
import { getOutfitSuggestions } from "@/lib/gemini/suggestions";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeatherByCoordinates } from "@/lib/utils/weather";

const DAILY_LIMIT = 20;
const FEATURE_NAME = "outfit_suggestions";

type WardrobeSuggestionItem = {
  id: string;
  name: string;
  category: string;
  occasion_tags: string[];
  season_tags: string[];
};

type ProfileSuggestionFields = {
  style_preferences: string[] | null;
  location_lat: number | null;
  location_lng: number | null;
};

type RateUsageRow = {
  count: number;
};

type OutfitSuggestionsRequest = {
  occasion?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getDailyUsage(userId: string, usageDate: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", FEATURE_NAME)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read AI usage.");
  }

  return (data as RateUsageRow | null)?.count ?? 0;
}

async function incrementDailyUsage(userId: string, usageDate: string, nextCount: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("ai_usage").upsert(
    {
      user_id: userId,
      feature: FEATURE_NAME,
      usage_date: usageDate,
      count: nextCount,
    },
    {
      onConflict: "user_id,feature,usage_date",
    }
  );

  if (error) {
    throw new Error("Unable to update AI usage.");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const usageDate = getTodayDateString();
    const usageCount = await getDailyUsage(user.id, usageDate);
    if (usageCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily outfit suggestions limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const requestBody = rawBody as OutfitSuggestionsRequest;
    if (
      requestBody.occasion !== undefined &&
      (typeof requestBody.occasion !== "string" || requestBody.occasion.trim().length === 0)
    ) {
      return NextResponse.json({ error: "occasion must be a non-empty string when provided." }, { status: 400 });
    }

    const { data: wardrobeData, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("id,name,category,occasion_tags,season_tags")
      .eq("user_id", user.id);

    if (wardrobeError) {
      return NextResponse.json({ error: "Unable to fetch wardrobe items." }, { status: 500 });
    }

    const wardrobeItems = (wardrobeData ?? []) as WardrobeSuggestionItem[];
    if (wardrobeItems.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("style_preferences,location_lat,location_lng")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "Unable to fetch profile." }, { status: 500 });
    }

    const profile = profileData as ProfileSuggestionFields;
    if (profile.location_lat === null || profile.location_lng === null) {
      return NextResponse.json({ error: "Location coordinates are required for outfit suggestions." }, { status: 400 });
    }

    const weather = await getCurrentWeatherByCoordinates(profile.location_lat, profile.location_lng);

    const suggestions = await getOutfitSuggestions({
      wardrobeItems,
      weather,
      stylePreferences: profile.style_preferences ?? [],
      occasion: requestBody.occasion?.trim(),
    });

    const wardrobeIds = new Set(wardrobeItems.map((item) => item.id));
    const validatedSuggestions = suggestions.filter((suggestion) =>
      suggestion.item_ids.every((itemId) => wardrobeIds.has(itemId))
    );

    await incrementDailyUsage(user.id, usageDate, usageCount + 1);

    return NextResponse.json({ suggestions: validatedSuggestions });
  } catch {
    return NextResponse.json({ error: "Unable to generate outfit suggestions." }, { status: 500 });
  }
}
