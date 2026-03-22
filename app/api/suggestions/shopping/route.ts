import { NextResponse } from "next/server";
import { getShoppingSuggestions } from "@/lib/gemini/suggestions";
import { createClient } from "@/lib/supabase/server";

const FEATURE_NAME = "shopping_suggestions";
const DAILY_LIMIT = 5;

type UsageRow = {
  count: number;
};

type WardrobeSummaryItem = {
  category: string;
  material_tags: string[] | null;
  occasion_tags: string[] | null;
  season_tags: string[] | null;
};

type ProfileSummary = {
  body_type: string | null;
  body_fit_notes: string[] | null;
  style_preferences: string[] | null;
};

type StoredSuggestion = {
  id: string;
  user_id: string;
  item_name: string;
  reason: string;
  search_term: string;
  affiliate_url: string | null;
  category: string;
  dismissed: boolean;
  saved: boolean;
  generated_at: string;
};

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentSeason(): string {
  const month = new Date().getUTCMonth() + 1;
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "fall";
}

function getSevenDaysAgoIso(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 7);
  return date.toISOString();
}

function toWardrobeSummary(items: WardrobeSummaryItem[]): string {
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  items.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;

    const tags = [...(item.material_tags ?? []), ...(item.occasion_tags ?? []), ...(item.season_tags ?? [])];
    tags.forEach((tag) => {
      const key = tag.trim().toLowerCase();
      if (!key) return;
      tagCounts[key] = (tagCounts[key] ?? 0) + 1;
    });
  });

  const commonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return JSON.stringify({ category_counts: categoryCounts, common_tags: commonTags });
}

function buildAffiliateUrl(searchTerm: string): string | null {
  const trimmedSearch = searchTerm.trim();
  if (!trimmedSearch) {
    return null;
  }

  const affiliateTag = process.env.AMAZON_AFFILIATE_TAG?.trim();
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(trimmedSearch)}`;
  return affiliateTag ? `${base}&tag=${affiliateTag}` : base;
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

  return (data as UsageRow | null)?.count ?? 0;
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

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sevenDaysAgo = getSevenDaysAgoIso();
    const { data: existingSuggestions, error: existingError } = await supabase
      .from("shopping_suggestions")
      .select("*")
      .eq("user_id", user.id)
      .gte("generated_at", sevenDaysAgo)
      .order("generated_at", { ascending: false });

    if (existingError) {
      return NextResponse.json({ error: "Unable to fetch shopping suggestions." }, { status: 500 });
    }

    if ((existingSuggestions ?? []).length > 0) {
      return NextResponse.json({ suggestions: existingSuggestions as StoredSuggestion[], cached: true });
    }

    const usageDate = getTodayDateString();
    const usageCount = await getDailyUsage(user.id, usageDate);
    if (usageCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily shopping suggestions limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const { data: wardrobeRows, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("category,material_tags,occasion_tags,season_tags")
      .eq("user_id", user.id);

    if (wardrobeError) {
      return NextResponse.json({ error: "Unable to fetch wardrobe summary." }, { status: 500 });
    }

    const wardrobeSummary = toWardrobeSummary((wardrobeRows ?? []) as WardrobeSummaryItem[]);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("body_type,body_fit_notes,style_preferences")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "Unable to fetch profile data." }, { status: 500 });
    }

    const profile = profileData as ProfileSummary;
    const generatedSuggestions = await getShoppingSuggestions({
      wardrobeSummary,
      bodyType: profile.body_type ?? "unknown",
      fitNotes: profile.body_fit_notes ?? [],
      stylePreferences: profile.style_preferences ?? [],
      currentSeason: getCurrentSeason(),
    });

    const suggestionsToInsert = generatedSuggestions.map((item) => ({
      user_id: user.id,
      item_name: item.item_name,
      reason: item.reason,
      search_term: item.search_term,
      affiliate_url: buildAffiliateUrl(item.search_term),
      category: item.category,
    }));

    const { data: savedSuggestions, error: saveError } = await supabase
      .from("shopping_suggestions")
      .insert(suggestionsToInsert)
      .select("*");

    if (saveError) {
      return NextResponse.json({ error: "Unable to save shopping suggestions." }, { status: 500 });
    }

    await incrementDailyUsage(user.id, usageDate, usageCount + 1);

    return NextResponse.json({ suggestions: (savedSuggestions ?? []) as StoredSuggestion[], cached: false });
  } catch {
    return NextResponse.json({ error: "Unable to generate shopping suggestions." }, { status: 500 });
  }
}
