import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type WardrobeItemInsert = {
  image_url: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "outerwear" | "accessories";
  subcategory: string;
  colors: string[];
  pattern: "solid" | "striped" | "checked" | "floral" | "graphic" | "other";
  material_tags: string[];
  season_tags: string[];
  occasion_tags: string[];
  brand?: string | null;
  ai_analyzed?: boolean;
  ai_metadata?: Record<string, unknown> | null;
};

type WardrobeItemPatch = Partial<WardrobeItemInsert> & {
  id: string;
};

const VALID_CATEGORIES = ["tops", "bottoms", "shoes", "outerwear", "accessories"] as const;
const VALID_PATTERNS = ["solid", "striped", "checked", "floral", "graphic", "other"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidCategory(value: unknown): value is WardrobeItemInsert["category"] {
  return typeof value === "string" && VALID_CATEGORIES.includes(value as (typeof VALID_CATEGORIES)[number]);
}

function isValidPattern(value: unknown): value is WardrobeItemInsert["pattern"] {
  return typeof value === "string" && VALID_PATTERNS.includes(value as (typeof VALID_PATTERNS)[number]);
}

function sanitizeOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim();
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

async function userOwnsWardrobeItem(itemId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("id")
    .eq("id", itemId)
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
    const itemId = searchParams.get("id");
    const supabase = createClient();

    if (itemId) {
      const ownsItem = await userOwnsWardrobeItem(itemId, userId);
      if (!ownsItem) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }

      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        return NextResponse.json({ error: "Unable to fetch item." }, { status: 500 });
      }

      return NextResponse.json({ item: data });
    }

    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Unable to fetch items." }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch {
    return NextResponse.json({ error: "Unable to fetch wardrobe items." }, { status: 500 });
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

    const body = rawBody as WardrobeItemInsert & { user_id?: string };
    if (body.user_id && body.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (typeof body.image_url !== "string" || body.image_url.trim().length === 0) {
      return NextResponse.json({ error: "image_url is required." }, { status: 400 });
    }
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }
    if (!isValidCategory(body.category)) {
      return NextResponse.json({ error: "category is invalid." }, { status: 400 });
    }
    if (typeof body.subcategory !== "string" || body.subcategory.trim().length === 0) {
      return NextResponse.json({ error: "subcategory is required." }, { status: 400 });
    }
    if (!isStringArray(body.colors) || body.colors.length === 0) {
      return NextResponse.json({ error: "colors must be a non-empty string array." }, { status: 400 });
    }
    if (!isValidPattern(body.pattern)) {
      return NextResponse.json({ error: "pattern is invalid." }, { status: 400 });
    }
    if (!isStringArray(body.material_tags)) {
      return NextResponse.json({ error: "material_tags must be a string array." }, { status: 400 });
    }
    if (!isStringArray(body.season_tags)) {
      return NextResponse.json({ error: "season_tags must be a string array." }, { status: 400 });
    }
    if (!isStringArray(body.occasion_tags)) {
      return NextResponse.json({ error: "occasion_tags must be a string array." }, { status: 400 });
    }
    if (body.ai_analyzed !== undefined && typeof body.ai_analyzed !== "boolean") {
      return NextResponse.json({ error: "ai_analyzed must be a boolean." }, { status: 400 });
    }
    if (body.ai_metadata !== undefined && body.ai_metadata !== null && !isRecord(body.ai_metadata)) {
      return NextResponse.json({ error: "ai_metadata must be an object or null." }, { status: 400 });
    }
    if (body.brand !== undefined && body.brand !== null && typeof body.brand !== "string") {
      return NextResponse.json({ error: "brand must be a string or null." }, { status: 400 });
    }

    const sanitizedInsert: WardrobeItemInsert = {
      image_url: body.image_url.trim(),
      name: body.name.trim(),
      category: body.category,
      subcategory: body.subcategory.trim(),
      colors: body.colors.map((color) => color.trim()).filter(Boolean),
      pattern: body.pattern,
      material_tags: body.material_tags.map((tag) => tag.trim()).filter(Boolean),
      season_tags: body.season_tags.map((tag) => tag.trim()).filter(Boolean),
      occasion_tags: body.occasion_tags.map((tag) => tag.trim()).filter(Boolean),
      brand: sanitizeOptionalString(body.brand),
      ai_analyzed: body.ai_analyzed,
      ai_metadata: body.ai_metadata ?? null,
    };

    if (sanitizedInsert.colors.length === 0) {
      return NextResponse.json({ error: "colors must include at least one value." }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert({ ...sanitizedInsert, user_id: userId })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to create item." }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create wardrobe item." }, { status: 500 });
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

    const body = rawBody as WardrobeItemPatch;
    if (!body.id) {
      return NextResponse.json({ error: "Item id is required." }, { status: 400 });
    }

    const ownsItem = await userOwnsWardrobeItem(body.id, userId);
    if (!ownsItem) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const { id, ...updates } = body;
    const sanitizedUpdates: Partial<WardrobeItemInsert> = {};

    if (updates.image_url !== undefined) {
      if (typeof updates.image_url !== "string" || updates.image_url.trim().length === 0) {
        return NextResponse.json({ error: "image_url must be a non-empty string." }, { status: 400 });
      }
      sanitizedUpdates.image_url = updates.image_url.trim();
    }
    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || updates.name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string." }, { status: 400 });
      }
      sanitizedUpdates.name = updates.name.trim();
    }
    if (updates.category !== undefined) {
      if (!isValidCategory(updates.category)) {
        return NextResponse.json({ error: "category is invalid." }, { status: 400 });
      }
      sanitizedUpdates.category = updates.category;
    }
    if (updates.subcategory !== undefined) {
      if (typeof updates.subcategory !== "string" || updates.subcategory.trim().length === 0) {
        return NextResponse.json({ error: "subcategory must be a non-empty string." }, { status: 400 });
      }
      sanitizedUpdates.subcategory = updates.subcategory.trim();
    }
    if (updates.colors !== undefined) {
      if (!isStringArray(updates.colors) || updates.colors.length === 0) {
        return NextResponse.json({ error: "colors must be a non-empty string array." }, { status: 400 });
      }
      sanitizedUpdates.colors = updates.colors.map((color) => color.trim()).filter(Boolean);
    }
    if (updates.pattern !== undefined) {
      if (!isValidPattern(updates.pattern)) {
        return NextResponse.json({ error: "pattern is invalid." }, { status: 400 });
      }
      sanitizedUpdates.pattern = updates.pattern;
    }
    if (updates.material_tags !== undefined) {
      if (!isStringArray(updates.material_tags)) {
        return NextResponse.json({ error: "material_tags must be a string array." }, { status: 400 });
      }
      sanitizedUpdates.material_tags = updates.material_tags.map((tag) => tag.trim()).filter(Boolean);
    }
    if (updates.season_tags !== undefined) {
      if (!isStringArray(updates.season_tags)) {
        return NextResponse.json({ error: "season_tags must be a string array." }, { status: 400 });
      }
      sanitizedUpdates.season_tags = updates.season_tags.map((tag) => tag.trim()).filter(Boolean);
    }
    if (updates.occasion_tags !== undefined) {
      if (!isStringArray(updates.occasion_tags)) {
        return NextResponse.json({ error: "occasion_tags must be a string array." }, { status: 400 });
      }
      sanitizedUpdates.occasion_tags = updates.occasion_tags.map((tag) => tag.trim()).filter(Boolean);
    }
    if (updates.brand !== undefined) {
      if (updates.brand !== null && typeof updates.brand !== "string") {
        return NextResponse.json({ error: "brand must be a string or null." }, { status: 400 });
      }
      sanitizedUpdates.brand = sanitizeOptionalString(updates.brand);
    }
    if (updates.ai_analyzed !== undefined) {
      if (typeof updates.ai_analyzed !== "boolean") {
        return NextResponse.json({ error: "ai_analyzed must be a boolean." }, { status: 400 });
      }
      sanitizedUpdates.ai_analyzed = updates.ai_analyzed;
    }
    if (updates.ai_metadata !== undefined) {
      if (updates.ai_metadata !== null && !isRecord(updates.ai_metadata)) {
        return NextResponse.json({ error: "ai_metadata must be an object or null." }, { status: 400 });
      }
      sanitizedUpdates.ai_metadata = updates.ai_metadata;
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: "At least one valid field is required to update." }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("wardrobe_items")
      .update(sanitizedUpdates)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to update item." }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json({ error: "Unable to update wardrobe item." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    if (!itemId) {
      return NextResponse.json({ error: "Item id is required." }, { status: 400 });
    }

    const ownsItem = await userOwnsWardrobeItem(itemId, userId);
    if (!ownsItem) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("wardrobe_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Unable to delete item." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete wardrobe item." }, { status: 500 });
  }
}
