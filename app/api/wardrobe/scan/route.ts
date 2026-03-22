import { NextResponse } from "next/server";
import { scanClothingItem } from "@/lib/gemini/scan";
import { createClient } from "@/lib/supabase/server";

const DAILY_SCAN_LIMIT = 50;
const FEATURE_NAME = "clothing_scan";

type RateLimitRow = {
  count: number;
};

type ScanRequestBody = {
  imageUrl?: string;
  aiAnalyzed?: boolean;
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

async function getDailyUsageCount(userId: string, usageDate: string): Promise<number> {
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

  return (data as RateLimitRow | null)?.count ?? 0;
}

async function incrementDailyUsageCount(userId: string, usageDate: string, nextCount: number) {
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

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as ScanRequestBody;
    const imageUrl = body.imageUrl?.trim();
    const aiAnalyzed = Boolean(body.aiAnalyzed);

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required." }, { status: 400 });
    }
    if (!isHttpUrl(imageUrl)) {
      return NextResponse.json({ error: "imageUrl must be a valid http(s) URL." }, { status: 400 });
    }

    const usageDate = getTodayDateString();
    const currentCount = await getDailyUsageCount(user.id, usageDate);

    if (currentCount >= DAILY_SCAN_LIMIT) {
      return NextResponse.json(
        { error: "Daily clothing scan limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Unable to fetch image." }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    const scanResult = await scanClothingItem({
      imageUrl: dataUrl,
      aiAnalyzed,
    });

    if (scanResult === null) {
      return NextResponse.json({ skipped: true, result: null });
    }

    await incrementDailyUsageCount(user.id, usageDate, currentCount + 1);

    if ("error" in scanResult.result && scanResult.result.error === "invalid_image") {
      return NextResponse.json(
        { error: "We could not detect a single clear clothing item in that image." },
        { status: 400 }
      );
    }

    return NextResponse.json({ result: scanResult.result });
  } catch {
    return NextResponse.json({ error: "Unable to process clothing scan." }, { status: 500 });
  }
}
