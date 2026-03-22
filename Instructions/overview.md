# WardrobeAI — Project Overview

## What It Is
WardrobeAI is a full-stack web app that lets users:
1. **Scan their wardrobe** — Upload photos of clothing items. AI analyzes and categorizes each item (type, color, pattern, tags).
2. **Organize their wardrobe** — Browse, filter, and manage their clothing catalog.
3. **Build outfits** — Combine wardrobe items into named, saved outfits.
4. **Plan the week** — Assign outfits to specific days on a weekly calendar.
5. **Get AI outfit suggestions** — Based on weather, location, trends, and personal style.
6. **Get shopping suggestions** — AI recommends new items based on body proportions, wardrobe gaps, and style preferences. Includes Amazon affiliate links and search terms.

---

## Core User Flow
1. User signs up → completes profile (uploads body photo, sets style preferences, shares location)
2. User scans wardrobe (uploads clothing photos one at a time or in batch)
3. AI classifies each item and stores metadata — user can manually correct it
4. User builds outfits from scanned items
5. User plans the week by assigning outfits to days
6. App fetches weather for user's location and suggests appropriate outfits
7. App suggests new purchases based on wardrobe gaps, body type, and style profile

---

## Tech Stack
| Layer            | Technology              |
|------------------|-------------------------|
| Frontend & API   | Next.js 14 (App Router) |
| Database & Auth  | Supabase                |
| File Storage     | Supabase Storage        |
| Styling          | Tailwind CSS            |
| AI               | Google Gemini 2.0 Flash |
| Weather          | OpenWeatherMap API      |
| Hosting          | Vercel                  |

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENWEATHER_API_KEY=
NEXT_PUBLIC_APP_URL=
AMAZON_AFFILIATE_TAG=         # optional, for affiliate links
```

---

## Folder Structure
```
wardrobe-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── wardrobe/page.tsx
│   │   ├── outfits/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── suggestions/page.tsx
│   │   └── profile/page.tsx
│   ├── api/
│   │   ├── wardrobe/
│   │   │   ├── scan/route.ts           ← AI clothing analysis endpoint
│   │   │   └── items/route.ts          ← CRUD for wardrobe items
│   │   ├── outfits/route.ts
│   │   ├── planner/route.ts
│   │   ├── suggestions/
│   │   │   ├── outfits/route.ts        ← AI outfit suggestions
│   │   │   └── shopping/route.ts       ← AI shopping suggestions
│   │   ├── profile/
│   │   │   └── analyze/route.ts        ← AI body analysis
│   │   └── weather/route.ts
│   ├── layout.tsx
│   └── page.tsx                        ← Landing/marketing page
├── components/
│   ├── ui/                             ← Reusable primitives only
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Badge.tsx
│   ├── wardrobe/
│   │   ├── WardrobeItemCard.tsx
│   │   ├── WardrobeGrid.tsx
│   │   └── ScanUploader.tsx
│   ├── outfits/
│   │   ├── OutfitBuilder.tsx
│   │   └── OutfitCard.tsx
│   └── planner/
│       └── WeeklyPlanner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← Browser Supabase client
│   │   └── server.ts                   ← Server Supabase client
│   ├── gemini/
│   │   ├── client.ts                   ← Gemini client initialization
│   │   ├── scan.ts                     ← Clothing scan prompt logic
│   │   ├── bodyAnalysis.ts             ← Body photo analysis logic
│   │   └── suggestions.ts              ← Outfit + shopping suggestion logic
│   └── utils/
│       ├── weather.ts
│       └── logger.ts
├── types/
│   └── index.ts                        ← All shared TypeScript interfaces
├── instructions/                       ← This folder — AI context docs
│   ├── overview.md                     ← (this file)
│   ├── database-schema.md
│   ├── ai-integration.md
│   ├── components-guide.md
│   └── phases.md
└── .cursorrules
```

---

## Key Constraints
- All Supabase queries must go through server-side code only.
- All OpenAI calls are server-side only (inside `app/api/` routes).
- Every Supabase table must have RLS enabled with user-scoped policies.
- Images are stored in Supabase Storage. Only URLs are stored in the database.
- Body photos and measurement data are sensitive — handled with strict RLS and never exposed publicly.
- AI results are cached in the database to avoid redundant API calls and control costs.