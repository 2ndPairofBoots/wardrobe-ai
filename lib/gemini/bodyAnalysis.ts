import { getGeminiModel } from "./client";

type BodyType =
  | "athletic"
  | "pear"
  | "rectangle"
  | "hourglass"
  | "inverted triangle"
  | string;

type ProportionBand = "narrow" | "average" | "broad" | "short" | "long";

export type BodyAnalysisResult = {
  body_type: BodyType;
  proportions: {
    shoulders: ProportionBand;
    torso: ProportionBand;
    legs: ProportionBand;
  };
  fit_notes: string[];
};

export type BodyAnalysisOutput = {
  result: BodyAnalysisResult;
  rawResponse: string;
};

const systemPrompt = `You are a personal styling expert. Analyze the body proportions in the photo and return structured JSON.
Be respectful and neutral. Focus only on proportions relevant to clothing fit.
Respond with valid JSON only — no markdown, no explanation.`;

const userPrompt = `Analyze the body proportions in this photo and return JSON:
{
  "body_type": "e.g. athletic, pear, rectangle, hourglass, inverted triangle",
  "proportions": {
    "shoulders": "narrow | average | broad",
    "torso": "short | average | long",
    "legs": "short | average | long"
  },
  "fit_notes": ["2-4 practical clothing fit tips based on these proportions"]
}`;

async function requestBodyAnalysis(imageUrl: string): Promise<string> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Unable to fetch body image.");
  }

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
  return result.response.text();
}

function parseBodyAnalysis(rawResponse: string): BodyAnalysisResult {
  const parsed = JSON.parse(rawResponse) as Record<string, unknown>;
  const proportions = (parsed.proportions ?? {}) as Record<string, unknown>;

  return {
    body_type: String(parsed.body_type ?? ""),
    proportions: {
      shoulders: String(proportions.shoulders ?? "average") as ProportionBand,
      torso: String(proportions.torso ?? "average") as ProportionBand,
      legs: String(proportions.legs ?? "average") as ProportionBand,
    },
    fit_notes: Array.isArray(parsed.fit_notes) ? parsed.fit_notes.map((note) => String(note)) : [],
  };
}

export async function analyzeBodyPhoto(imageUrl: string): Promise<BodyAnalysisOutput> {
  try {
    let rawResponse = await requestBodyAnalysis(imageUrl);

    try {
      const result = parseBodyAnalysis(rawResponse);
      return { result, rawResponse };
    } catch {
      rawResponse = await requestBodyAnalysis(imageUrl);
      const result = parseBodyAnalysis(rawResponse);
      return { result, rawResponse };
    }
  } catch {
    throw new Error("Unable to analyze body photo.");
  }
}
