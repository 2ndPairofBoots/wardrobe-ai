"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { WardrobeItem } from "@/types";
import { WardrobeItemCard } from "./WardrobeItemCard";

export interface WardrobeGridProps {
  items: WardrobeItem[];
  loading: boolean;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (id: string) => void;
}

const categories: Array<WardrobeItem["category"] | "all"> = [
  "all",
  "tops",
  "bottoms",
  "shoes",
  "outerwear",
  "accessories",
];

export function WardrobeGrid({ items, loading, onEdit, onDelete }: WardrobeGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [search, setSearch] = useState("");

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    items.forEach((item) => item.colors.forEach((color) => colorSet.add(color.toLowerCase())));
    return Array.from(colorSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
      const colorMatch =
        selectedColor === "all" ||
        item.colors.map((color) => color.toLowerCase()).includes(selectedColor.toLowerCase());
      const searchMatch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      return categoryMatch && colorMatch && searchMatch;
    });
  }, [items, search, selectedCategory, selectedColor]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={`skeleton-${index}`} padding="md" hoverable={false}>
            <div className="h-48 animate-pulse rounded-xl bg-border" />
            <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-border" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-border" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-lg px-3 py-2 text-sm capitalize transition-colors ${
              selectedCategory === category
                ? "bg-primary text-text-primary"
                : "bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {category}
          </button>
        ))}

        <select
          value={selectedColor}
          onChange={(event) => setSelectedColor(event.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          aria-label="Filter by color"
        >
          <option value="all">All colors</option>
          {availableColors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
          className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary sm:min-w-56 sm:flex-1"
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card padding="lg" hoverable={false}>
          <p className="text-center text-text-secondary">
            No items found. Scan your first item to build your wardrobe.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <WardrobeItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
