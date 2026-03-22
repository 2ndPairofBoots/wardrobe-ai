"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Outfit, WardrobeItem } from "@/types";

export interface OutfitBuilderProps {
  wardrobeItems: WardrobeItem[];
  onSave: (outfit: Omit<Outfit, "id" | "user_id" | "created_at">) => void;
  onCancel: () => void;
  initialOutfit?: Outfit;
}

type SlotCategory = "tops" | "bottoms" | "shoes" | "outerwear" | "accessories";

const slotOrder: SlotCategory[] = ["tops", "bottoms", "shoes", "outerwear", "accessories"];

export function OutfitBuilder({ wardrobeItems, onSave, onCancel, initialOutfit }: OutfitBuilderProps) {
  const [name, setName] = useState(initialOutfit?.name ?? "");
  const [occasion, setOccasion] = useState(initialOutfit?.occasion ?? "");
  const [season, setSeason] = useState(initialOutfit?.season ?? "");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<SlotCategory | "all">("all");
  const [selectedSlot, setSelectedSlot] = useState<SlotCategory>("tops");
  const [slotSelections, setSlotSelections] = useState<Record<SlotCategory, string | null>>({
    tops: null,
    bottoms: null,
    shoes: null,
    outerwear: null,
    accessories: null,
  });

  useEffect(() => {
    if (!initialOutfit) {
      return;
    }

    const nextSelections: Record<SlotCategory, string | null> = {
      tops: null,
      bottoms: null,
      shoes: null,
      outerwear: null,
      accessories: null,
    };

    initialOutfit.item_ids.forEach((id) => {
      const item = wardrobeItems.find((entry) => entry.id === id);
      if (!item) {
        return;
      }
      nextSelections[item.category] = id;
    });

    setSlotSelections(nextSelections);
  }, [initialOutfit, wardrobeItems]);

  const filteredItems = useMemo(() => {
    return wardrobeItems.filter((item) => {
      const categoryMatch = filterCategory === "all" || item.category === filterCategory;
      const slotMatch = item.category === selectedSlot;
      const searchMatch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      return categoryMatch && slotMatch && searchMatch;
    });
  }, [filterCategory, search, selectedSlot, wardrobeItems]);

  const selectedItems = useMemo(
    () =>
      slotOrder
        .map((slot) => wardrobeItems.find((item) => item.id === slotSelections[slot]) ?? null)
        .filter((item): item is WardrobeItem => Boolean(item)),
    [slotSelections, wardrobeItems]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
      <Card padding="md" hoverable={false}>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wardrobe items"
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary"
            />
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value as SlotCategory | "all")}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary"
            >
              <option value="all">All categories</option>
              {slotOrder.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {slotOrder.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg px-3 py-2 text-sm capitalize ${
                  selectedSlot === slot
                    ? "bg-primary text-[#fff6e8]"
                    : "bg-white text-text-secondary hover:text-text-primary"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSlotSelections((prev) => ({ ...prev, [selectedSlot]: item.id }))}
                className="rounded-xl border border-border bg-white p-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="relative h-24 overflow-hidden rounded-lg">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                </div>
                <p className="mt-2 line-clamp-1 text-sm text-text-primary">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="md" hoverable={false}>
        <div className="space-y-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Outfit name"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              placeholder="Occasion"
              className="rounded-lg border border-border bg-white px-3 py-2 text-text-primary"
            />
            <input
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              placeholder="Season"
              className="rounded-lg border border-border bg-white px-3 py-2 text-text-primary"
            />
          </div>

          <div className="space-y-2">
            {slotOrder.map((slot) => {
              const selected = wardrobeItems.find((item) => item.id === slotSelections[slot]) ?? null;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <span className="shrink-0 capitalize text-text-secondary">{slot}</span>
                  <span className="min-w-0 line-clamp-1 text-right text-text-primary">
                    {selected?.name ?? "Select item"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="md"
              loading={false}
              onClick={() =>
                onSave({
                  name: name.trim(),
                  item_ids: selectedItems.map((item) => item.id),
                  occasion: occasion.trim() || null,
                  season: season.trim() || null,
                  notes: initialOutfit?.notes ?? null,
                })
              }
            >
              Save
            </Button>
            <Button variant="ghost" size="md" loading={false} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
