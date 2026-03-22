# Project Phases Plan

## Phase 1 — Foundation & Auth
**Goal**: Working app shell with authentication and navigation.  
**Commit when**: User can sign up, log in, and see the dashboard layout.

### Tasks
1. Initialize Next.js 14 project with TypeScript and Tailwind CSS
2. Install and configure Supabase client (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
3. Set up `.env.local` with all required environment variables (confirm it is in `.gitignore`)
4. Create `types/index.ts` with all shared TypeScript interfaces from `database-schema.md`
5. Configure `tailwind.config.ts` with design tokens from `components-guide.md`
6. Build UI primitives: Button, Card, Modal, LoadingSpinner, Badge
7. Build auth pages: `/login` and `/signup` using Supabase Auth
8. Set up Supabase: create all tables with RLS policies and storage buckets
9. Add the profile auto-create trigger to Supabase
10. Build the dashboard layout with sidebar navigation (Wardrobe, Outfits, Planner, Suggestions, Profile)
11. Add route protection — redirect unauthenticated users to `/login`
12. Build a minimal onboarding flow (style preferences, location) that sets `onboarding_complete = true`

---

## Phase 2 — Wardrobe Scanning
**Goal**: User can scan clothing items and view their wardrobe.  
**Commit when**: User can upload a photo, get AI classification, edit it, save it, and see it in their wardrobe grid.

### Tasks
1. Set up OpenAI SDK (`npm install openai`)
2. Build `lib/openai/scan.ts` with the clothing scan prompt from `ai-integration.md`
3. Build `app/api/wardrobe/scan/route.ts` — handles image URL → OpenAI → store result
4. Build `app/api/wardrobe/items/route.ts` — GET (list), POST (create), PATCH (update), DELETE
5. Build ScanUploader component (see `components-guide.md` for the 5-state flow)
6. Build WardrobeItemCard component
7. Build WardrobeGrid component with category/color filters and search
8. Build the `/wardrobe` page — scan button + WardrobeGrid
9. Add rate limiting for the scan endpoint (50/day) using a Supabase usage counter
10. Handle the `{"error": "invalid_image"}` case with a friendly UI message
11. Add edit modal so users can correct AI-generated metadata

---

## Phase 3 — Outfit Builder & Weekly Planner
**Goal**: User can create outfits from their wardrobe and assign them to days.  
**Commit when**: User can build an outfit, save it, and assign it to days in the weekly planner.

### Tasks
1. Build `app/api/outfits/route.ts` — GET, POST, PATCH, DELETE
2. Build OutfitBuilder component
3. Build OutfitCard component
4. Build the `/outfits` page — create outfit button + grid of OutfitCards
5. Build `app/api/planner/route.ts` — GET week's plans, POST/PATCH assign outfit to date, DELETE clear date
6. Build WeeklyPlanner component with prev/next week navigation
7. Build the `/planner` page

---

## Phase 4 — AI Outfit Suggestions
**Goal**: App suggests outfits from the user's wardrobe based on weather, location, and style.  
**Commit when**: User sees 3 AI-generated outfit suggestions with weather context on the suggestions page.

### Tasks
1. Set up OpenWeatherMap API — build `lib/utils/weather.ts` and `app/api/weather/route.ts`
2. Build `lib/openai/suggestions.ts` with the outfit suggestion prompt from `ai-integration.md`
3. Build `app/api/suggestions/outfits/route.ts`
4. Build the outfit suggestions UI section on `/suggestions` page
5. Add rate limiting (20/day) for outfit suggestions
6. Validate all `item_ids` in AI response exist in the user's wardrobe before displaying
7. Add "Save this outfit" button to add an AI suggestion directly to saved outfits

---

## Phase 5 — Body Analysis & Shopping Suggestions
**Goal**: User uploads a body photo, gets fit notes, and receives personalized shopping recommendations.  
**Commit when**: User sees shopping suggestions with Amazon affiliate links on the suggestions page.

### Tasks
1. Build `lib/openai/bodyAnalysis.ts` with the body analysis prompt from `ai-integration.md`
2. Build `app/api/profile/analyze/route.ts`
3. Add body photo upload to the `/profile` page (uses `profile-photos` Supabase Storage bucket)
4. Display fit notes in the profile page in friendly language (not raw AI output)
5. Build the shopping suggestions prompt in `lib/openai/suggestions.ts`
6. Build `app/api/suggestions/shopping/route.ts` — includes Amazon affiliate URL construction
7. Add 7-day caching logic: if suggestions exist from the last 7 days, return those instead
8. Build the shopping suggestions UI section on `/suggestions` page
9. Add dismiss and save actions per suggestion (updates `dismissed` / `saved` columns)
10. Add rate limiting (5/day) for shopping suggestions

---

## Phase 6 — Polish & Deploy
**Goal**: App is stable, secure, performant, and deployed.  
**Commit when**: App is live on Vercel.

### Tasks
1. Audit all Supabase tables — confirm RLS is active and policies are correct
2. Audit all API routes — confirm auth checks and input validation on every route
3. Add error boundaries to all major page sections
4. Add loading skeletons to all data-fetching sections
5. Test all flows on mobile — fix any layout or usability issues
6. Run a Gemini security and code quality review on each major feature (see `overview.md`)
7. Set up Vercel project and connect GitHub repo
8. Add all environment variables to Vercel dashboard
9. Configure Supabase Auth redirect URLs for the production domain
10. Deploy and smoke test all features on production

---

## Notes on Prompting Cursor by Phase

- **Phase 1–2**: Provide `.cursorrules`, `instructions/overview.md`, and `instructions/database-schema.md` as context.
- **Phase 3**: Add `instructions/components-guide.md` to context. Reference the OutfitBuilder and WeeklyPlanner specs.
- **Phase 4–5**: Add `instructions/ai-integration.md` to context for every AI-related task.
- **All phases**: When starting a new Cursor chat, briefly describe what phase you are in, what feature you are building, and list the specific files involved. Never start a new prompt without this context.
- Break each task above into its own Cursor prompt. Do not combine multiple tasks into one prompt.
