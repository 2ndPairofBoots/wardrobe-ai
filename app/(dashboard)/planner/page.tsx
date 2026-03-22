"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import { Card } from "@/components/ui/Card";
import type { Outfit, WardrobeItem, WeeklyPlan } from "@/types";

type PlannerResponse = {
  plans?: WeeklyPlan[];
  error?: string;
};

type OutfitsResponse = {
  outfits?: Outfit[];
  error?: string;
};

type WardrobeItemsResponse = {
  items?: WardrobeItem[];
  error?: string;
};

function getWeekStart(date: Date): Date {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function PlannerPage() {
  const [weekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekStartKey = useMemo(() => toDateKey(weekStart), [weekStart]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [plannerResponse, outfitsResponse, itemsResponse] = await Promise.all([
        fetch(`/api/planner?week_start=${encodeURIComponent(weekStartKey)}`),
        fetch("/api/outfits"),
        fetch("/api/wardrobe/items"),
      ]);

      const plannerJson = (await plannerResponse.json()) as PlannerResponse;
      const outfitsJson = (await outfitsResponse.json()) as OutfitsResponse;
      const itemsJson = (await itemsResponse.json()) as WardrobeItemsResponse;

      if (!plannerResponse.ok) {
        setError(plannerJson.error ?? "Unable to load planner.");
        return;
      }
      if (!outfitsResponse.ok) {
        setError(outfitsJson.error ?? "Unable to load outfits.");
        return;
      }
      if (!itemsResponse.ok) {
        setError(itemsJson.error ?? "Unable to load wardrobe items.");
        return;
      }

      setPlans(plannerJson.plans ?? []);
      setOutfits(outfitsJson.outfits ?? []);
      setWardrobeItems(itemsJson.items ?? []);
    } catch {
      setError("Unable to load planner.");
    } finally {
      setLoading(false);
    }
  }, [weekStartKey]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleAssign(date: string, outfitId: string) {
    setError(null);
    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: date, outfit_id: outfitId }),
      });
      const json = (await response.json()) as { plan?: WeeklyPlan; error?: string };

      if (!response.ok || !json.plan) {
        setError(json.error ?? "Unable to assign outfit.");
        return;
      }

      setPlans((prev) => {
        const existingIndex = prev.findIndex((entry) => entry.plan_date === json.plan?.plan_date);
        if (existingIndex === -1) {
          return [...prev, json.plan!];
        }
        const next = [...prev];
        next[existingIndex] = json.plan!;
        return next;
      });
    } catch {
      setError("Unable to assign outfit.");
    }
  }

  async function handleClear(date: string) {
    setError(null);
    try {
      const response = await fetch("/api/planner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: date }),
      });

      if (!response.ok) {
        const json = (await response.json()) as { error?: string };
        setError(json.error ?? "Unable to clear day.");
        return;
      }

      setPlans((prev) => prev.filter((entry) => entry.plan_date !== date));
    } catch {
      setError("Unable to clear day.");
    }
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Planner</h1>
        <p className="mt-1 text-sm text-text-secondary">Plan outfits for each day of the week.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      {loading ? (
        <Card padding="lg" hoverable={false}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={`planner-skeleton-${index}`} className="h-24 animate-pulse rounded-lg bg-border" />
            ))}
          </div>
        </Card>
      ) : (
        <WeeklyPlanner
          weekStart={weekStart}
          plans={plans}
          outfits={outfits}
          wardrobeItems={wardrobeItems}
          onAssign={handleAssign}
          onClear={handleClear}
        />
      )}
    </main>
  );
}
