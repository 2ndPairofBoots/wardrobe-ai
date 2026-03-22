import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PlannerUpsertBody = {
  plan_date: string;
  outfit_id: string | null;
  notes?: string | null;
};

type PlannerDeleteBody = {
  plan_date: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

async function userOwnsOutfit(outfitId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("outfits")
    .select("id")
    .eq("id", outfitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify outfit ownership.");
  }

  return Boolean(data);
}

async function userOwnsPlanForDate(planDate: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_date", planDate)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify plan ownership.");
  }

  return Boolean(data);
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getWeekEndDate(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("week_start");

    if (!weekStart || !isValidDateString(weekStart)) {
      return NextResponse.json({ error: "week_start is required in YYYY-MM-DD format." }, { status: 400 });
    }

    const weekEnd = getWeekEndDate(weekStart);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("weekly_plans")
      .select("*")
      .eq("user_id", userId)
      .gte("plan_date", weekStart)
      .lte("plan_date", weekEnd)
      .order("plan_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Unable to fetch weekly plans." }, { status: 500 });
    }

    return NextResponse.json({ plans: data, week_start: weekStart, week_end: weekEnd });
  } catch {
    return NextResponse.json({ error: "Unable to fetch weekly plans." }, { status: 500 });
  }
}

async function assignOutfitToDate(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as PlannerUpsertBody;
    if (!body.plan_date || !isValidDateString(body.plan_date)) {
      return NextResponse.json({ error: "plan_date is required in YYYY-MM-DD format." }, { status: 400 });
    }
    if (body.outfit_id !== null && typeof body.outfit_id !== "string") {
      return NextResponse.json({ error: "outfit_id must be a string or null." }, { status: 400 });
    }
    if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes must be a string or null." }, { status: 400 });
    }

    if (body.outfit_id) {
      const ownsOutfit = await userOwnsOutfit(body.outfit_id, userId);
      if (!ownsOutfit) {
        return NextResponse.json({ error: "Outfit not found." }, { status: 404 });
      }
    }

    const supabase = createClient();
    const { data: existingPlan, error: existingPlanError } = await supabase
      .from("weekly_plans")
      .select("id, user_id")
      .eq("user_id", userId)
      .eq("plan_date", body.plan_date)
      .maybeSingle();

    if (existingPlanError) {
      return NextResponse.json({ error: "Unable to verify existing plan." }, { status: 500 });
    }

    if (existingPlan && existingPlan.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("weekly_plans")
      .upsert(
        {
          user_id: userId,
          plan_date: body.plan_date,
          outfit_id: body.outfit_id,
          notes: body.notes ?? null,
        },
        { onConflict: "user_id,plan_date" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to save plan." }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
  } catch {
    return NextResponse.json({ error: "Unable to save plan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return assignOutfitToDate(request);
}

export async function PATCH(request: Request) {
  return assignOutfitToDate(request);
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as PlannerDeleteBody;
    if (!body.plan_date || !isValidDateString(body.plan_date)) {
      return NextResponse.json({ error: "plan_date is required in YYYY-MM-DD format." }, { status: 400 });
    }

    const ownsPlan = await userOwnsPlanForDate(body.plan_date, userId);
    if (!ownsPlan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("weekly_plans")
      .delete()
      .eq("user_id", userId)
      .eq("plan_date", body.plan_date);

    if (error) {
      return NextResponse.json({ error: "Unable to clear plan." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to clear plan." }, { status: 500 });
  }
}
