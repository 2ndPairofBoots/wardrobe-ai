import { NextResponse } from "next/server";
import { analyzeBodyPhoto } from "@/lib/gemini/bodyAnalysis";
import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = 3;
const FEATURE_NAME = "body_analysis";

type AnalyzeRequestBody = {
  bodyPhotoUrl?: string;
  body_photo_url?: string;
};

type UsageRow = {
  count: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
        { error: "Daily body analysis limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as AnalyzeRequestBody;
    const bodyPhotoUrl = body.bodyPhotoUrl?.trim() || body.body_photo_url?.trim();

    if (!bodyPhotoUrl) {
      return NextResponse.json({ error: "bodyPhotoUrl is required." }, { status: 400 });
    }
    if (!isHttpUrl(bodyPhotoUrl)) {
      return NextResponse.json({ error: "bodyPhotoUrl must be a valid http(s) URL." }, { status: 400 });
    }

    const imageResponse = await fetch(bodyPhotoUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Unable to fetch body photo." }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    const analysis = await analyzeBodyPhoto(dataUrl);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        body_type: analysis.result.body_type,
        body_fit_notes: analysis.result.fit_notes,
      })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: "Unable to update profile analysis data." }, { status: 500 });
    }

    await incrementDailyUsage(user.id, usageDate, usageCount + 1);

    return NextResponse.json({
      body_type: analysis.result.body_type,
      body_fit_notes: analysis.result.fit_notes,
    });
  } catch {
    return NextResponse.json({ error: "Unable to analyze body photo." }, { status: 500 });
  }
}
