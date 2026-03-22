# AI Integration Guide

## Provider
**Google Gemini 2.0 Flash** handles all AI features — clothing image classification, body photo analysis,
outfit suggestions, and shopping recommendations. It handles both vision and text in a single API,
has a free tier, and is fast enough for real-time scanning.

Install the SDK: `npm install @google/generative-ai`

Get your API key at **aistudio.google.com** → Get API key. Add it to `.env.local` as `GEMINI_API_KEY`.

All Gemini calls are server-side only. They live in `lib/gemini/` and are called from `app/api/` routes.

### Initializing the client (lib/gemini/client.ts)
```ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const getGeminiModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
```

### Sending an image to Gemini
Gemini requires images as base64 inline parts, not URLs. Fetch the image from Supabase Storage
server-side and convert it before passing to Gemini:
```ts
const imageResponse = await fetch(imageUrl)
const imageBuffer = await imageResponse.arrayBuffer()
const base64Image = Buffer.from(imageBuffer).toString('base64')
const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

const imagePart = {
  inlineData: {
    data: base64Image,
    mimeType: contentType,
  },
}
```

### Calling the model
```ts
const model = getGeminiModel()
const result = await model.generateContent([systemPrompt + '\n\n' + userPrompt, imagePart])
const text = result.response.text()
```

For text-only calls (no image), just pass the prompt string:
```ts
const result = await model.generateContent(prompt)
const text = result.response.text()
```

---

## Feature 1: Clothing Item Scan
**Route**: `app/api/wardrobe/scan/route.ts`  
**Library**: `lib/gemini/scan.ts`

### Input
- User uploads a photo of one clothing item
- Image is uploaded to Supabase Storage, then fetched server-side and converted to base64 before passing to Gemini

### System Prompt
```
You are a fashion expert AI that analyzes clothing item photos.
Given an image of a single clothing item, return structured JSON metadata.
Respond with valid JSON only — no markdown, no explanation, no code fences.
Use only the allowed values for category and tags listed below.
If the image is unclear, not a clothing item, or shows multiple items, return: {"error": "invalid_image"}
```

### User Prompt
```
Analyze this clothing item and return JSON with these exact fields:
{
  "name": "descriptive name, e.g. White slim-fit Oxford shirt",
  "category": "tops | bottoms | shoes | outerwear | accessories",
  "subcategory": "e.g. shirt, jeans, sneakers, jacket, scarf",
  "colors": ["array of colors present"],
  "pattern": "solid | striped | checked | floral | graphic | other",
  "material_tags": ["inferred material/fit tags, e.g. cotton, slim fit, oversized"],
  "season_tags": ["spring | summer | fall | winter — include all that apply"],
  "occasion_tags": ["casual | work | formal | sport | smart-casual — include all that apply"]
}
```

### Logic
- If `ai_analyzed` is already `true` on the item, skip the API call entirely.
- Parse the JSON response. If parsing fails, retry once.
- Store the raw response in `ai_metadata` and set `ai_analyzed = true`.
- If `{"error": "invalid_image"}` is returned, surface a friendly message to the user.

---

## Feature 2: Body Photo Analysis
**Route**: `app/api/profile/analyze/route.ts`  
**Library**: `lib/gemini/bodyAnalysis.ts`

### Input
- Full-body photo of the user (uploaded to Supabase Storage `profile-photos` bucket)

### System Prompt
```
You are a personal styling expert. Analyze the body proportions in the photo and return structured JSON.
Be respectful and neutral. Focus only on proportions relevant to clothing fit.
Respond with valid JSON only — no markdown, no explanation.
```

### User Prompt
```
Analyze the body proportions in this photo and return JSON:
{
  "body_type": "e.g. athletic, pear, rectangle, hourglass, inverted triangle",
  "proportions": {
    "shoulders": "narrow | average | broad",
    "torso": "short | average | long",
    "legs": "short | average | long"
  },
  "fit_notes": ["2-4 practical clothing fit tips based on these proportions"]
}
```

### Logic
- Store `body_type` in `profiles.body_type`.
- Store `fit_notes` in `profiles.body_fit_notes`.
- Store full response in `profiles.ai_metadata` (add this column if not present).
- Do not display raw AI output to the user. Translate fit_notes into the UI in friendly language.
- This is sensitive data. Confirm RLS policy is in place before building this feature.

---

## Feature 3: AI Outfit Suggestions
**Route**: `app/api/suggestions/outfits/route.ts`  
**Library**: `lib/gemini/suggestions.ts`

### Input
- User's wardrobe items (pass name + category + occasion_tags + season_tags — NOT image data)
- Current weather from OpenWeatherMap (temp in °C, conditions)
- User's style_preferences from profile
- Optional: occasion requested by user

### System Prompt
```
You are a personal stylist AI. Suggest outfit combinations using only items from the user's wardrobe.
Respond with valid JSON only — no markdown, no explanation.
Never suggest items not present in the wardrobe list provided.
```

### User Prompt
```
Wardrobe: [pass as JSON array of {id, name, category, occasion_tags, season_tags}]
Weather: [temp]°C, [conditions]
Style preferences: [array]
Occasion (optional): [occasion]

Suggest 3 outfit combinations. Return JSON array:
[
  {
    "name": "outfit name",
    "item_ids": ["uuid", "uuid", "uuid"],
    "reasoning": "brief explanation why this works for the weather/occasion"
  }
]
```

### Logic
- Validate that every `item_id` in the response actually exists in the user's wardrobe before saving.
- These are not persisted to the database — return them directly to the client for display.

---

## Feature 4: Shopping Suggestions
**Route**: `app/api/suggestions/shopping/route.ts`  
**Library**: `lib/gemini/suggestions.ts`

### Input
- Summary of user's current wardrobe (category counts + common tags)
- `body_type` and `body_fit_notes` from profile
- `style_preferences` from profile
- Current season

### System Prompt
```
You are a personal shopping advisor. Identify gaps in the user's wardrobe and suggest specific items to buy.
Base suggestions on their body type, fit notes, style preferences, and what they're currently missing.
Respond with valid JSON only — no markdown, no explanation.
```

### User Prompt
```
Current wardrobe summary: [category counts and style tags]
Body type: [body_type]
Fit notes: [body_fit_notes]
Style preferences: [style_preferences]
Current season: [season]

Suggest 6-8 items to fill wardrobe gaps. Return JSON array:
[
  {
    "item_name": "specific item name",
    "reason": "why this fills a gap or suits their body/style",
    "search_term": "Amazon-optimized search string for this item",
    "category": "tops | bottoms | shoes | outerwear | accessories"
  }
]
```

### Logic
After getting the AI response, construct an Amazon affiliate search URL for each item:
```ts
const affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(item.search_term)}&tag=${process.env.AMAZON_AFFILIATE_TAG}`
```
Save results to `shopping_suggestions` table. Do not regenerate if suggestions already exist from
the last 7 days — return existing ones instead.

---

## Rate Limits
Track usage in Supabase with a `ai_usage` table or per-user counters. Enforce server-side.

| Feature              | Limit         |
|----------------------|---------------|
| Clothing scan        | 50 per day    |
| Outfit suggestions   | 20 per day    |
| Shopping suggestions | 5 per day     |
| Body analysis        | 3 per day     |

Return HTTP 429 with a user-friendly message when limits are hit.

---

## Cost Management
- Cache all results. Re-use stored AI output wherever possible.
- Pass minimal data to the API (names and tags, not image data) for text-only prompts.
- Shopping suggestions are the most expensive call — limit strictly and cache aggressively.
- Log token usage per call in server logs to monitor costs.

---

## Error Handling
- Wrap every Gemini call in try/catch.
- If JSON parsing fails, retry the call once. If it fails again, return HTTP 500 with a generic message.
- Never expose Gemini error messages or stack traces to the client.
- Log all AI errors server-side with enough detail to debug (prompt, response, timestamp).