import { getGeminiModel } from "./client";

type ClothingCategory = "tops" | "bottoms" | "shoes" | "outerwear" | "accessories";
type ClothingPattern = "solid" | "striped" | "checked" | "floral" | "graphic" | "other";
type SeasonTag = "spring" | "summer" | "fall" | "winter";
type OccasionTag = "casual" | "work" | "formal" | "sport" | "smart-casual";

export type ClothingScanResult = {
  name: string;
  category: ClothingCategory;
  subcategory: string;
  colors: string[];
  pattern: ClothingPattern;
  material_tags: string[];
  season_tags: SeasonTag[];
  occasion_tags: OccasionTag[];
};

type InvalidImageResult = {
  error: "invalid_image";
};

export type ScanOutput = {
  result: ClothingScanResult | InvalidImageResult;
  rawResponse: string;
  aiAnalyzed: boolean;
};

type ScanInput = {
  imageUrl: string;
  aiAnalyzed: boolean;
};

const systemPrompt = `You are a fashion expert AI that analyzes clothing item photos.
Given an image of a single clothing item, return structured JSON metadata.
Respond with valid JSON only — no markdown, no explanation, no code fences.
Use only the allowed values for category and tags listed below.
If the image is unclear, not a clothing item, or shows multiple items, return: {"error": "invalid_image"}`;

const userPrompt = `Analyze this clothing item and return JSON with these exact fields:
{
  "name": "descriptive name, e.g. White slim-fit Oxford shirt",
  "category": "tops | bottoms | shoes | outerwear | accessories",
  "subcategory": "e.g. shirt, jeans, sneakers, jacket, scarf",
  "colors": ["array of colors present"],
  "pattern": "solid | striped | checked | floral | graphic | other",
  "material_tags": ["inferred material/fit tags, e.g. cotton, slim fit, oversized"],
  "season_tags": ["spring | summer | fall | winter — include all that apply"],
  "occasion_tags": ["casual | work | formal | sport | smart-casual — include all that apply"]
}`;

async function requestScan(imageUrl: string): Promise<string> {
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: contentType,
    },
  };

  const model = getGeminiModel();
  const result = await model.generateContent([systemPrompt + "\n\n" + userPrompt, imagePart]);
  const text = result.response.text();
  return text;
}

function parseScanResponse(rawResponse: string): ClothingScanResult | InvalidImageResult {
  const parsed = JSON.parse(rawResponse) as Record<string, unknown>;

  if (parsed.error === "invalid_image") {
    return { error: "invalid_image" };
  }

  return {
    name: String(parsed.name ?? ""),
    category: parsed.category as ClothingCategory,
    subcategory: String(parsed.subcategory ?? ""),
    colors: Array.isArray(parsed.colors) ? parsed.colors.map((value) => String(value)) : [],
    pattern: parsed.pattern as ClothingPattern,
    material_tags: Array.isArray(parsed.material_tags)
      ? parsed.material_tags.map((value) => String(value))
      : [],
    season_tags: Array.isArray(parsed.season_tags)
      ? (parsed.season_tags.map((value) => String(value)) as SeasonTag[])
      : [],
    occasion_tags: Array.isArray(parsed.occasion_tags)
      ? (parsed.occasion_tags.map((value) => String(value)) as OccasionTag[])
      : [],
  };
}

export async function scanClothingItem({ imageUrl, aiAnalyzed }: ScanInput): Promise<ScanOutput | null> {
  if (aiAnalyzed) {
    return null;
  }

  try {
    let rawResponse = await requestScan(imageUrl);

    try {
      const result = parseScanResponse(rawResponse);
      return { result, rawResponse, aiAnalyzed: true };
    } catch {
      rawResponse = await requestScan(imageUrl);
      const result = parseScanResponse(rawResponse);
      return { result, rawResponse, aiAnalyzed: true };
    }
  } catch {
    throw new Error("Unable to analyze clothing image.");
  }
}
