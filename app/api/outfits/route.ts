import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OutfitInsert = {
  name: string;
  item_ids: string[];
  occasion?: string | null;
  season?: string | null;
  notes?: string | null;
};

type OutfitPatch = Partial<OutfitInsert> & {
  id: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
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
    throw new Error("Ownership check failed.");
  }

  return Boolean(data);
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const outfitId = searchParams.get("id");
    const supabase = createClient();

    if (outfitId) {
      const ownsOutfit = await userOwnsOutfit(outfitId, userId);
      if (!ownsOutfit) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }

      const { data, error } = await supabase.from("outfits").select("*").eq("id", outfitId).single();

      if (error) {
        return NextResponse.json({ error: "Unable to fetch outfit." }, { status: 500 });
      }

      return NextResponse.json({ outfit: data });
    }

    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Unable to fetch outfits." }, { status: 500 });
    }

    return NextResponse.json({ outfits: data });
  } catch {
    return NextResponse.json({ error: "Unable to fetch outfits." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as OutfitInsert & { user_id?: string };
    if (body.user_id && body.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }
    if (!isStringArray(body.item_ids) || body.item_ids.length === 0) {
      return NextResponse.json({ error: "item_ids must be a non-empty string array." }, { status: 400 });
    }
    if (body.occasion !== undefined && body.occasion !== null && typeof body.occasion !== "string") {
      return NextResponse.json({ error: "occasion must be a string or null." }, { status: 400 });
    }
    if (body.season !== undefined && body.season !== null && typeof body.season !== "string") {
      return NextResponse.json({ error: "season must be a string or null." }, { status: 400 });
    }
    if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes must be a string or null." }, { status: 400 });
    }

    const sanitizedInsert: OutfitInsert = {
      name: body.name.trim(),
      item_ids: body.item_ids.map((itemId) => itemId.trim()).filter(Boolean),
      occasion: body.occasion?.trim() || null,
      season: body.season?.trim() || null,
      notes: body.notes?.trim() || null,
    };

    if (sanitizedInsert.item_ids.length === 0) {
      return NextResponse.json({ error: "item_ids must include at least one value." }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("outfits")
      .insert({ ...sanitizedInsert, user_id: userId })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to create outfit." }, { status: 500 });
    }

    return NextResponse.json({ outfit: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create outfit." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    if (!isRecord(rawBody)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = rawBody as OutfitPatch;
    if (!body.id) {
      return NextResponse.json({ error: "Outfit id is required." }, { status: 400 });
    }

    const ownsOutfit = await userOwnsOutfit(body.id, userId);
    if (!ownsOutfit) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const { id, ...updates } = body;
    const sanitizedUpdates: Partial<OutfitInsert> = {};

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || updates.name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string." }, { status: 400 });
      }
      sanitizedUpdates.name = updates.name.trim();
    }

    if (updates.item_ids !== undefined) {
      if (!isStringArray(updates.item_ids) || updates.item_ids.length === 0) {
        return NextResponse.json({ error: "item_ids must be a non-empty string array." }, { status: 400 });
      }
      const itemIds = updates.item_ids.map((itemId) => itemId.trim()).filter(Boolean);
      if (itemIds.length === 0) {
        return NextResponse.json({ error: "item_ids must include at least one value." }, { status: 400 });
      }
      sanitizedUpdates.item_ids = itemIds;
    }

    if (updates.occasion !== undefined) {
      if (updates.occasion !== null && typeof updates.occasion !== "string") {
        return NextResponse.json({ error: "occasion must be a string or null." }, { status: 400 });
      }
      sanitizedUpdates.occasion = updates.occasion?.trim() || null;
    }

    if (updates.season !== undefined) {
      if (updates.season !== null && typeof updates.season !== "string") {
        return NextResponse.json({ error: "season must be a string or null." }, { status: 400 });
      }
      sanitizedUpdates.season = updates.season?.trim() || null;
    }

    if (updates.notes !== undefined) {
      if (updates.notes !== null && typeof updates.notes !== "string") {
        return NextResponse.json({ error: "notes must be a string or null." }, { status: 400 });
      }
      sanitizedUpdates.notes = updates.notes?.trim() || null;
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: "At least one valid field is required to update." }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("outfits")
      .update(sanitizedUpdates)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to update outfit." }, { status: 500 });
    }

    return NextResponse.json({ outfit: data });
  } catch {
    return NextResponse.json({ error: "Unable to update outfit." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const outfitId = searchParams.get("id");

    if (!outfitId) {
      return NextResponse.json({ error: "Outfit id is required." }, { status: 400 });
    }

    const ownsOutfit = await userOwnsOutfit(outfitId, userId);
    if (!ownsOutfit) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const supabase = createClient();
    const { error } = await supabase.from("outfits").delete().eq("id", outfitId).eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Unable to delete outfit." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete outfit." }, { status: 500 });
  }
}
