"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WardrobeItem } from "@/types";

type OutfitSuggestion = {
  name: string;
  item_ids: string[];
  reasoning: string;
};

type SuggestionResponse = {
  suggestions?: OutfitSuggestion[];
  error?: string;
  remaining_today?: number;
};

type ShoppingSuggestion = {
  id: string;
  item_name: string;
  reason: string;
  search_term: string;
  affiliate_url: string | null;
  dismissed: boolean;
  saved: boolean;
};

type ShoppingSuggestionsResponse = {
  suggestions?: ShoppingSuggestion[];
  error?: string;
};

type WardrobeResponse = {
  items?: WardrobeItem[];
  error?: string;
};

type OutfitCreateResponse = {
  outfit?: { id: string };
  error?: string;
};

export default function SuggestionsPage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [savingIndexes, setSavingIndexes] = useState<number[]>([]);
  const [savedIndexes, setSavedIndexes] = useState<number[]>([]);
  const [shoppingSuggestions, setShoppingSuggestions] = useState<ShoppingSuggestion[]>([]);
  const [loadingShopping, setLoadingShopping] = useState(false);
  const [updatingShoppingIds, setUpdatingShoppingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWardrobe() {
      setLoadingWardrobe(true);
      try {
        const response = await fetch("/api/wardrobe/items");
        const json = (await response.json()) as WardrobeResponse;
        if (!response.ok) {
          setError(json.error ?? "Unable to load wardrobe.");
          return;
        }
        setWardrobeItems(json.items ?? []);
      } catch {
        setError("Unable to load wardrobe.");
      } finally {
        setLoadingWardrobe(false);
      }
    }

    void loadWardrobe();
  }, []);

  const wardrobeNameById = useMemo(() => {
    const map = new Map<string, string>();
    wardrobeItems.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [wardrobeItems]);

  async function handleGenerate() {
    setError(null);
    setLoadingSuggestions(true);
    setSavedIndexes([]);

    try {
      const response = await fetch("/api/suggestions/outfits", { method: "POST" });
      const json = (await response.json()) as SuggestionResponse;
      if (!response.ok) {
        if (response.status === 429) {
          const remainingToday =
            typeof json.remaining_today === "number" ? json.remaining_today : 0;
          setError(
            `You have reached today's suggestion limit. You have ${remainingToday} suggestions left today.`
          );
        } else {
          setError(json.error ?? "Unable to generate suggestions.");
        }
        setSuggestions([]);
        return;
      }

      setSuggestions((json.suggestions ?? []).slice(0, 3));
    } catch {
      setError("Unable to generate suggestions.");
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSaveSuggestion(suggestion: OutfitSuggestion, index: number) {
    setError(null);
    setSavingIndexes((prev) => [...prev, index]);

    try {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestion.name,
          item_ids: suggestion.item_ids,
          notes: suggestion.reasoning,
          occasion: null,
          season: null,
        }),
      });

      const json = (await response.json()) as OutfitCreateResponse;
      if (!response.ok || !json.outfit) {
        setError(json.error ?? "Unable to save outfit.");
        return;
      }

      setSavedIndexes((prev) => [...prev, index]);
    } catch {
      setError("Unable to save outfit.");
    } finally {
      setSavingIndexes((prev) => prev.filter((value) => value !== index));
    }
  }

  async function handleGenerateShoppingSuggestions() {
    setError(null);
    setLoadingShopping(true);

    try {
      const response = await fetch("/api/suggestions/shopping", { method: "POST" });
      const json = (await response.json()) as ShoppingSuggestionsResponse;
      if (!response.ok) {
        setError(json.error ?? "Unable to generate shopping suggestions.");
        return;
      }

      setShoppingSuggestions(json.suggestions ?? []);
    } catch {
      setError("Unable to generate shopping suggestions.");
    } finally {
      setLoadingShopping(false);
    }
  }

  async function updateShoppingSuggestion(
    id: string,
    updates: Partial<Pick<ShoppingSuggestion, "dismissed" | "saved">>
  ) {
    setError(null);
    setUpdatingShoppingIds((prev) => [...prev, id]);

    try {
      const response = await fetch("/api/suggestions/shopping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const json = (await response.json()) as { error?: string };
        setError(json.error ?? "Unable to update shopping suggestion.");
        return;
      }

      setShoppingSuggestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    } catch {
      setError("Unable to update shopping suggestion.");
    } finally {
      setUpdatingShoppingIds((prev) => prev.filter((entry) => entry !== id));
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-[#fff9ef] to-[#fff4e2] p-5 sm:p-6">
        <h1 className="text-2xl font-semibold text-text-primary">Suggestions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Generate outfit ideas and optional shopping recommendations from your existing wardrobe.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">Generate 3 outfit ideas tailored to your current closet.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={loadingSuggestions}
          disabled={loadingWardrobe}
          onClick={handleGenerate}
        >
          Generate suggestions
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      {loadingWardrobe ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`suggestions-wardrobe-skeleton-${index}`} padding="md" hoverable={false}>
              <div className="h-5 w-2/3 animate-pulse rounded bg-border" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-border" />
              <div className="mt-4 h-8 w-28 animate-pulse rounded bg-border" />
            </Card>
          ))}
        </div>
      ) : loadingSuggestions ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`suggestions-loading-skeleton-${index}`} padding="md" hoverable={false}>
              <div className="h-5 w-2/3 animate-pulse rounded bg-border" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-4/6 animate-pulse rounded bg-border" />
              <div className="mt-4 h-8 w-28 animate-pulse rounded bg-border" />
            </Card>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <Card padding="lg" hoverable={false}>
          <p className="text-sm text-text-secondary">No suggestions yet. Click generate to get 3 outfit ideas.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card key={`${suggestion.name}-${index}`} padding="md" hoverable={false}>
              <div className="space-y-3">
                <h2 className="text-base font-medium text-text-primary">{suggestion.name}</h2>
                <p className="text-sm text-text-secondary">{suggestion.reasoning}</p>
                <div className="space-y-1">
                  {suggestion.item_ids.map((itemId) => (
                    <p key={`${index}-${itemId}`} className="text-xs text-text-muted">
                      - {wardrobeNameById.get(itemId) ?? itemId}
                    </p>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={savingIndexes.includes(index)}
                  disabled={savedIndexes.includes(index)}
                  onClick={() => handleSaveSuggestion(suggestion, index)}
                >
                  {savedIndexes.includes(index) ? "Saved" : "Save to outfits"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Shopping suggestions</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Recommended items to fill wardrobe gaps based on your profile.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={loadingShopping}
          disabled={loadingWardrobe}
          onClick={handleGenerateShoppingSuggestions}
        >
          Generate shopping suggestions
        </Button>
      </div>

      {loadingShopping ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`shopping-loading-skeleton-${index}`} padding="md" hoverable={false}>
              <div className="h-5 w-3/4 animate-pulse rounded bg-border" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-border" />
              <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-border" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-border" />
                <div className="h-8 w-16 animate-pulse rounded bg-border" />
              </div>
            </Card>
          ))}
        </div>
      ) : shoppingSuggestions.length === 0 ? (
        <Card padding="lg" hoverable={false}>
          <p className="text-sm text-text-secondary">
            No shopping suggestions yet. Generate suggestions to see recommendations.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shoppingSuggestions.map((suggestion) => {
            const isUpdating = updatingShoppingIds.includes(suggestion.id);
            return (
              <Card key={suggestion.id} padding="md" hoverable={false}>
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-text-primary">{suggestion.item_name}</h3>
                  <p className="text-sm text-text-secondary">{suggestion.reason}</p>
                  <a
                    href={
                      suggestion.affiliate_url ??
                      `https://www.amazon.com/s?k=${encodeURIComponent(suggestion.search_term)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm text-primary hover:text-primary-hover"
                  >
                    Search on Amazon
                  </a>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={isUpdating && !suggestion.dismissed}
                      disabled={isUpdating || suggestion.dismissed}
                      onClick={() => updateShoppingSuggestion(suggestion.id, { dismissed: true })}
                    >
                      {suggestion.dismissed ? "Dismissed" : "Dismiss"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={isUpdating && !suggestion.saved}
                      disabled={isUpdating || suggestion.saved}
                      onClick={() => updateShoppingSuggestion(suggestion.id, { saved: true })}
                    >
                      {suggestion.saved ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
