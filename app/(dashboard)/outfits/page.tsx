"use client";

import { useEffect, useMemo, useState } from "react";
import { OutfitBuilder } from "@/components/outfits/OutfitBuilder";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { Outfit, WardrobeItem } from "@/types";

type OutfitsResponse = {
  outfits?: Outfit[];
  error?: string;
};

type WardrobeItemsResponse = {
  items?: WardrobeItem[];
  error?: string;
};

type OutfitResponse = {
  outfit?: Outfit;
  error?: string;
};

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  const initialBuilderOutfit = useMemo(() => editingOutfit ?? undefined, [editingOutfit]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [outfitsResponse, wardrobeResponse] = await Promise.all([
        fetch("/api/outfits"),
        fetch("/api/wardrobe/items"),
      ]);

      const outfitsJson = (await outfitsResponse.json()) as OutfitsResponse;
      const wardrobeJson = (await wardrobeResponse.json()) as WardrobeItemsResponse;

      if (!outfitsResponse.ok) {
        setError(outfitsJson.error ?? "Unable to load outfits.");
        return;
      }
      if (!wardrobeResponse.ok) {
        setError(wardrobeJson.error ?? "Unable to load wardrobe items.");
        return;
      }

      setOutfits(outfitsJson.outfits ?? []);
      setWardrobeItems(wardrobeJson.items ?? []);
    } catch {
      setError("Unable to load outfits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSave(outfit: Omit<Outfit, "id" | "user_id" | "created_at">) {
    setError(null);

    const isEditing = Boolean(editingOutfit);
    const payload = isEditing ? { id: editingOutfit?.id, ...outfit } : outfit;

    try {
      const response = await fetch("/api/outfits", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as OutfitResponse;
      if (!response.ok || !json.outfit) {
        setError(json.error ?? "Unable to save outfit.");
        return;
      }

      if (isEditing) {
        setOutfits((prev) => prev.map((entry) => (entry.id === json.outfit?.id ? json.outfit : entry)));
      } else {
        setOutfits((prev) => [json.outfit!, ...prev]);
      }

      setEditingOutfit(null);
      setBuilderOpen(false);
    } catch {
      setError("Unable to save outfit.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this outfit?");
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/outfits?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        const json = (await response.json()) as { error?: string };
        setError(json.error ?? "Unable to delete outfit.");
        return;
      }

      setOutfits((prev) => prev.filter((entry) => entry.id !== id));
    } catch {
      setError("Unable to delete outfit.");
    }
  }

  function resolveOutfitItems(outfit: Outfit): WardrobeItem[] {
    const index = new Map(wardrobeItems.map((item) => [item.id, item]));
    return outfit.item_ids.map((id) => index.get(id)).filter((item): item is WardrobeItem => Boolean(item));
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Outfits</h1>
          <p className="mt-1 text-sm text-text-secondary">Create and manage your saved looks.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={false}
          onClick={() => {
            setEditingOutfit(null);
            setBuilderOpen(true);
          }}
        >
          Create outfit
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`outfit-skeleton-${index}`} padding="md" hoverable={false}>
              <div className="h-24 animate-pulse rounded-lg bg-border" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-border" />
            </Card>
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <Card padding="lg" hoverable={false}>
          <p className="text-center text-text-secondary">No outfits yet. Create your first outfit to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              items={resolveOutfitItems(outfit)}
              onEdit={(selectedOutfit) => {
                setEditingOutfit(selectedOutfit);
                setBuilderOpen(true);
              }}
              onDelete={handleDelete}
              onAssignToPlanner={() => {}}
            />
          ))}
        </div>
      )}

      <Modal
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingOutfit(null);
        }}
        title={editingOutfit ? "Edit outfit" : "Create outfit"}
      >
        <OutfitBuilder
          wardrobeItems={wardrobeItems}
          initialOutfit={initialBuilderOutfit}
          onSave={handleSave}
          onCancel={() => {
            setBuilderOpen(false);
            setEditingOutfit(null);
          }}
        />
      </Modal>
    </main>
  );
}
