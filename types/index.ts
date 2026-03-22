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
  category: "tops" | "bottoms" | "shoes" | "outerwear" | "accessories"
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
