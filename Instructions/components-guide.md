# Components Guide

## Rule
Always use the components listed here. Do not create alternatives or duplicates.
If a needed variant doesn't exist, extend the existing component — don't create a new one.

---

## UI Primitives (components/ui/)

### Button
Use for all interactive actions.

```tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  loading={boolean}     // shows spinner, disables click
  disabled={boolean}
  onClick={handler}
>
  Label
</Button>
```

### Card
Use for all content containers.

```tsx
<Card
  padding="sm" | "md" | "lg"
  hoverable={boolean}   // adds hover effect, use for clickable cards
>
  content
</Card>
```

### Modal
Use for all dialogs and overlays.

```tsx
<Modal
  open={boolean}
  onClose={() => {}}
  title="Modal Title"
>
  content
</Modal>
```

### LoadingSpinner
Use for all loading states.

```tsx
<LoadingSpinner size="sm" | "md" | "lg" />
```

### Badge
Use for tags, categories, status indicators.

```tsx
<Badge variant="default" | "success" | "warning" | "danger">
  text
</Badge>
```

---

## Feature Components

### WardrobeItemCard (components/wardrobe/WardrobeItemCard.tsx)
Displays a single clothing item in the wardrobe grid.

Shows: item photo, item name, category badge, color dot indicators.  
Actions: edit (opens edit modal), delete (confirm then delete).  
States: loading skeleton while image loads, error state if image fails.

Props:
```ts
interface WardrobeItemCardProps {
  item: WardrobeItem
  onEdit: (item: WardrobeItem) => void
  onDelete: (id: string) => void
}
```

---

### WardrobeGrid (components/wardrobe/WardrobeGrid.tsx)
Responsive grid of WardrobeItemCards.

Includes: category filter bar, color filter, search by name.  
Empty state: prompt to scan first item.  
Loading state: grid of skeleton cards.

Props:
```ts
interface WardrobeGridProps {
  items: WardrobeItem[]
  loading: boolean
  onEdit: (item: WardrobeItem) => void
  onDelete: (id: string) => void
}
```

---

### ScanUploader (components/wardrobe/ScanUploader.tsx)
Handles the clothing scan flow end to end.

States:
1. Idle — drag-and-drop zone or click to upload
2. Uploading — progress bar while uploading to Supabase Storage
3. Analyzing — spinner with "AI is analyzing your item..." message
4. Review — shows AI result with editable fields (name, category, tags)
5. Saved — success state, option to scan another

Props:
```ts
interface ScanUploaderProps {
  onScanComplete: (item: WardrobeItem) => void
}
```

---

### OutfitBuilder (components/outfits/OutfitBuilder.tsx)
Lets users create an outfit by selecting wardrobe items.

Layout: searchable/filterable wardrobe item list on the left, outfit slot area on the right.  
Outfit slots: one per category (top, bottom, shoes, outerwear, accessory). Click to assign from list.  
Actions: name the outfit, save, cancel.

Props:
```ts
interface OutfitBuilderProps {
  wardrobeItems: WardrobeItem[]
  onSave: (outfit: Omit<Outfit, 'id' | 'user_id' | 'created_at'>) => void
  onCancel: () => void
  initialOutfit?: Outfit   // for editing existing outfit
}
```

---

### OutfitCard (components/outfits/OutfitCard.tsx)
Displays a saved outfit as a card with a strip of item thumbnails.

Shows: outfit name, item photo strip (up to 5 items), occasion/season badges.  
Actions: edit, delete, assign to planner.

Props:
```ts
interface OutfitCardProps {
  outfit: Outfit
  items: WardrobeItem[]   // the resolved items for the outfit's item_ids
  onEdit: (outfit: Outfit) => void
  onDelete: (id: string) => void
  onAssignToPlanner: (outfit: Outfit) => void
}
```

---

### WeeklyPlanner (components/planner/WeeklyPlanner.tsx)
7-column calendar grid (Monday–Sunday) for planning outfits.

Each day shows: date label, assigned outfit thumbnail strip or empty state prompt.  
Click a day: opens outfit selector modal.  
Navigation: previous/next week arrows.

Props:
```ts
interface WeeklyPlannerProps {
  weekStart: Date
  plans: WeeklyPlan[]
  outfits: Outfit[]
  wardrobeItems: WardrobeItem[]
  onAssign: (date: string, outfitId: string) => void
  onClear: (date: string) => void
}
```

---

## Design System

Define all tokens in `tailwind.config.ts`. Use these exclusively — no hardcoded color values.

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#your-brand-color',
      'primary-hover': '#slightly-darker',
      surface: '#1c1c1e',       // card/panel backgrounds
      background: '#111111',    // page background
      border: '#2c2c2e',        // borders and dividers
      text: {
        primary: '#f5f5f7',
        secondary: '#a1a1aa',
        muted: '#52525b',
      },
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  }
}
```

**Theme**: Dark mode only. Fashion apps skew dark, and it frames clothing photography better.  
**Radius**: Consistent border radius — use `rounded-xl` for cards, `rounded-lg` for buttons, `rounded-full` for badges.  
**Shadows**: Minimal — rely on borders and subtle background contrast instead of heavy box shadows.
