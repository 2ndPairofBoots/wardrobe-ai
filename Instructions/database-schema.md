# Database Schema

## Tables

---

### profiles
Extends Supabase `auth.users`. Created automatically on signup via a Supabase database trigger.

| Column              | Type         | Notes                                              |
|---------------------|--------------|----------------------------------------------------|
| id                  | uuid         | PK, FK → auth.users.id                            |
| username            | text         | nullable                                           |
| avatar_url          | text         | nullable, Supabase Storage URL                     |
| body_photo_url      | text         | nullable, used for AI body analysis                |
| height_cm           | integer      | nullable                                           |
| body_type           | text         | nullable, AI-analyzed (e.g. "athletic", "pear")    |
| body_fit_notes      | text[]       | nullable, AI tips (e.g. ["avoid oversized tops"])  |
| style_preferences   | text[]       | nullable, e.g. ["casual", "streetwear", "minimal"] |
| location_city       | text         | nullable, for weather API calls                    |
| location_lat        | float8       | nullable                                           |
| location_lng        | float8       | nullable                                           |
| onboarding_complete | boolean      | default false                                      |
| created_at          | timestamptz  | default now()                                      |
| updated_at          | timestamptz  | default now()                                      |

**RLS**: Users can only select and update their own row (`auth.uid() = id`).

---

### wardrobe_items
Each scanned clothing item belonging to a user.

| Column          | Type        | Notes                                                              |
|-----------------|-------------|--------------------------------------------------------------------|
| id              | uuid        | PK, default gen_random_uuid()                                      |
| user_id         | uuid        | FK → auth.users.id                                                 |
| image_url       | text        | Supabase Storage URL                                               |
| name            | text        | e.g. "White Oxford Shirt"                                          |
| category        | text        | tops / bottoms / shoes / outerwear / accessories                   |
| subcategory     | text        | e.g. "shirt", "jeans", "sneakers", "jacket"                       |
| colors          | text[]      | e.g. ["white", "light blue"]                                       |
| pattern         | text        | solid / striped / checked / floral / graphic / other               |
| material_tags   | text[]      | e.g. ["cotton", "slim fit", "button-up"]                          |
| season_tags     | text[]      | spring / summer / fall / winter                                    |
| occasion_tags   | text[]      | casual / work / formal / sport / smart-casual                      |
| brand           | text        | nullable                                                           |
| ai_analyzed     | boolean     | default false — if true, skip re-analysis                         |
| ai_metadata     | jsonb       | raw AI response stored for debugging                               |
| created_at      | timestamptz | default now()                                                      |

**RLS**: Users can only select, insert, update, delete their own items (`auth.uid() = user_id`).

---

### outfits
A named collection of wardrobe item IDs forming a complete outfit.

| Column      | Type        | Notes                                      |
|-------------|-------------|--------------------------------------------|
| id          | uuid        | PK, default gen_random_uuid()              |
| user_id     | uuid        | FK → auth.users.id                        |
| name        | text        | e.g. "Friday Casual", "Date Night"        |
| item_ids    | uuid[]      | array of wardrobe_items IDs               |
| occasion    | text        | nullable                                   |
| season      | text        | nullable                                   |
| notes       | text        | nullable                                   |
| created_at  | timestamptz | default now()                              |

**RLS**: Users can only access their own outfits.

---

### weekly_plans
Maps a specific calendar date to an outfit for a user.

| Column      | Type        | Notes                                            |
|-------------|-------------|--------------------------------------------------|
| id          | uuid        | PK, default gen_random_uuid()                   |
| user_id     | uuid        | FK → auth.users.id                              |
| plan_date   | date        | the specific day                                 |
| outfit_id   | uuid        | FK → outfits.id, nullable (can be unassigned)   |
| notes       | text        | nullable                                         |
| created_at  | timestamptz | default now()                                    |

**RLS**: Users can only access their own plans.  
**Unique constraint**: `(user_id, plan_date)` — one outfit per user per day.

---

### shopping_suggestions
AI-generated shopping recommendations stored per user.

| Column       | Type        | Notes                                              |
|--------------|-------------|----------------------------------------------------|
| id           | uuid        | PK, default gen_random_uuid()                     |
| user_id      | uuid        | FK → auth.users.id                                |
| item_name    | text        | e.g. "White leather sneakers"                     |
| reason       | text        | why this was recommended                           |
| search_term  | text        | for constructing Amazon/Google search              |
| affiliate_url| text        | nullable, Amazon affiliate search URL              |
| category     | text        | same values as wardrobe_items.category             |
| dismissed    | boolean     | default false                                      |
| saved        | boolean     | default false                                      |
| generated_at | timestamptz | default now()                                      |

**RLS**: Users can only access their own suggestions.

---

## Supabase Storage Buckets

| Bucket            | Access  | Contents                             |
|-------------------|---------|--------------------------------------|
| wardrobe-images   | Private | Clothing item photos                 |
| profile-photos    | Private | User body photos and avatars         |

Both buckets require the user to be authenticated to read or write. Users can only access their own files — enforce via RLS policies on storage objects using `auth.uid()`.

---

## Database Triggers

### Auto-create profile on signup
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Auto-update updated_at on profiles
```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
```

---

## TypeScript Types (types/index.ts)

```ts
export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  body_photo_url: string | null
  height_cm: number | null
  body_type: string | null
  body_fit_notes: string[] | null
  style_preferences: string[] | null
  location_city: string | null
  location_lat: number | null
  location_lng: number | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  image_url: string
  name: string
  category: 'tops' | 'bottoms' | 'shoes' | 'outerwear' | 'accessories'
  subcategory: string
  colors: string[]
  pattern: string
  material_tags: string[]
  season_tags: string[]
  occasion_tags: string[]
  brand: string | null
  ai_analyzed: boolean
  ai_metadata: Record<string, unknown> | null
  created_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  item_ids: string[]
  occasion: string | null
  season: string | null
  notes: string | null
  created_at: string
}

export interface WeeklyPlan {
  id: string
  user_id: string
  plan_date: string
  outfit_id: string | null
  notes: string | null
  created_at: string
}

export interface ShoppingSuggestion {
  id: string
  user_id: string
  item_name: string
  reason: string
  search_term: string
  affiliate_url: string | null
  category: string
  dismissed: boolean
  saved: boolean
  generated_at: string
}
```
