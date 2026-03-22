"use client";

import { useEffect, useMemo, useState } from "react";
import { ScanUploader } from "@/components/wardrobe/ScanUploader";
import { WardrobeGrid } from "@/components/wardrobe/WardrobeGrid";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { WardrobeItem } from "@/types";

type ItemsResponse = {
  items?: WardrobeItem[];
  error?: string;
};

type ItemResponse = {
  item?: WardrobeItem;
  error?: string;
};

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/wardrobe/items");
      const json = (await response.json()) as ItemsResponse;

      if (!response.ok) {
        setError(json.error ?? "Unable to load wardrobe items.");
        setItems([]);
        return;
      }

      setItems(json.items ?? []);
    } catch {
      setError("Unable to load wardrobe items.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/wardrobe/items?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const json = (await response.json()) as { error?: string };
        setError(json.error ?? "Unable to delete item.");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Unable to delete item.");
    }
  }

  async function handleEdit(updatedItem: WardrobeItem) {
    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedItem.id,
          name: updatedItem.name,
          category: updatedItem.category,
          subcategory: updatedItem.subcategory,
          colors: updatedItem.colors,
          pattern: updatedItem.pattern,
          material_tags: updatedItem.material_tags,
          season_tags: updatedItem.season_tags,
          occasion_tags: updatedItem.occasion_tags,
          brand: updatedItem.brand,
        }),
      });
      const json = (await response.json()) as ItemResponse;

      if (!response.ok || !json.item) {
        setError(json.error ?? "Unable to update item.");
        return;
      }

      setItems((prev) => prev.map((item) => (item.id === json.item?.id ? json.item : item)));
    } catch {
      setError("Unable to update item.");
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) || (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      const matchesColor = selectedColor === null || item.colors.some((c) => c.toLowerCase() === selectedColor.toLowerCase());
      const matchesFavorite = !showFavoritesOnly || item.is_favorite;
      return matchesSearch && matchesCategory && matchesColor && matchesFavorite;
    });
  }, [items, searchQuery, selectedCategory, selectedColor, showFavoritesOnly]);

  const allColors = useMemo(() => {
    const colorSet = new Set<string>();
    items.forEach((item) => {
      item.colors.forEach((color) => colorSet.add(color));
    });
    return Array.from(colorSet).sort();
  }, [items]);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category))).sort();
  }, [items]);

  const wardrobeStats = useMemo(() => {
    return {
      total: items.length,
      favorites: items.filter((i) => i.is_favorite).length,
      mostWorn: items.reduce((max, item) => ((item.wear_count ?? 0) > (max.wear_count ?? 0) ? item : max), items[0]),
      categories: new Set(items.map((i) => i.category)).size,
    };
  }, [items]);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Wardrobe</h1>
          <p className="mt-1 text-sm text-text-secondary">{wardrobeStats.total} items • {wardrobeStats.categories} categories</p>
        </div>
        <Button variant="primary" size="md" loading={false} onClick={() => setScanOpen(true)}>
          Scan item
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Search items</label>
          <input
            type="text"
            placeholder="Search by name, brand, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none ring-primary/50 focus:ring-2"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Category</label>
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none ring-primary/50 focus:ring-2"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Color</label>
            <select
              value={selectedColor ?? ""}
              onChange={(e) => setSelectedColor(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none ring-primary/50 focus:ring-2"
            >
              <option value="">All colors</option>
              {allColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 w-full cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border border-text-secondary"
              />
              <span className="text-sm font-medium text-text-primary">Favorites only</span>
            </label>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <p className="text-sm text-text-secondary text-center">Showing {filteredItems.length} of {items.length} items</p>
      ) : null}

      <WardrobeGrid
        items={filteredItems.length > 0 ? filteredItems : (loading ? [] : [])}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {!loading && items.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-text-secondary">No items yet. Scan your first clothing item to get started!</p>
        </div>
      ) : null}

      {!loading && items.length > 0 && filteredItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-text-secondary">No items match your filters. Try adjusting your search.</p>
        </div>
      ) : null}

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Scan clothing item">
        <ScanUploader
          onScanComplete={(item) => {
            setItems((prev) => [item, ...prev]);
            setScanOpen(false);
          }}
        />
      </Modal>
    </main>
  );
}
