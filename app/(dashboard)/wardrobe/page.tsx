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

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Wardrobe</h1>
          <p className="mt-1 text-sm text-text-secondary">Scan and manage your clothing items.</p>
        </div>
        <Button variant="primary" size="md" loading={false} onClick={() => setScanOpen(true)}>
          Scan item
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      <WardrobeGrid
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
