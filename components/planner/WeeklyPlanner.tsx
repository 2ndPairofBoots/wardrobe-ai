"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Outfit, WardrobeItem, WeeklyPlan } from "@/types";

export interface WeeklyPlannerProps {
  weekStart: Date;
  plans: WeeklyPlan[];
  outfits: Outfit[];
  wardrobeItems: WardrobeItem[];
  onAssign: (date: string, outfitId: string) => void;
  onClear: (date: string) => void;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function WeeklyPlanner({
  weekStart,
  plans,
  outfits,
  wardrobeItems,
  onAssign,
  onClear,
}: WeeklyPlannerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(weekStart);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setCurrentWeekStart(weekStart);
  }, [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      return date;
    });
  }, [currentWeekStart]);

  const planByDate = useMemo(() => {
    const map = new Map<string, WeeklyPlan>();
    plans.forEach((plan) => map.set(plan.plan_date, plan));
    return map;
  }, [plans]);

  const itemById = useMemo(() => {
    const map = new Map<string, WardrobeItem>();
    wardrobeItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [wardrobeItems]);

  const selectedPlan = selectedDate ? planByDate.get(selectedDate) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-text-secondary sm:text-left">
          {formatLabel(weekDays[0])} - {formatLabel(weekDays[6])}
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            loading={false}
            onClick={() => {
              const previous = new Date(currentWeekStart);
              previous.setDate(previous.getDate() - 7);
              setCurrentWeekStart(previous);
            }}
          >
            Previous week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={false}
            onClick={() => {
              const next = new Date(currentWeekStart);
              next.setDate(next.getDate() + 7);
              setCurrentWeekStart(next);
            }}
          >
            Next week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {weekDays.map((day) => {
          const dayKey = toDateKey(day);
          const plan = planByDate.get(dayKey) ?? null;
          const assignedOutfit = plan?.outfit_id ? outfits.find((outfit) => outfit.id === plan.outfit_id) : null;
          const assignedItems = assignedOutfit
            ? assignedOutfit.item_ids.map((id) => itemById.get(id)).filter((item): item is WardrobeItem => Boolean(item))
            : [];

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => setSelectedDate(dayKey)}
              className="rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-foreground/20"
            >
              <p className="text-xs text-text-secondary">{formatLabel(day)}</p>
              {assignedOutfit ? (
                <div className="mt-2 space-y-2">
                  <p className="line-clamp-1 text-sm text-text-primary">{assignedOutfit.name}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {assignedItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative h-10 overflow-hidden rounded-md border border-border">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-text-muted">No outfit assigned</p>
              )}
            </button>
          );
        })}
      </div>

      <Modal open={Boolean(selectedDate)} onClose={() => setSelectedDate(null)} title="Assign outfit">
        {selectedDate ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Select an outfit for {selectedDate}</p>
            <div className="max-h-80 space-y-2 overflow-auto">
              {outfits.map((outfit) => (
                <button
                  key={outfit.id}
                  type="button"
                  onClick={() => {
                    onAssign(selectedDate, outfit.id);
                    setSelectedDate(null);
                  }}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-left text-sm text-text-primary transition-colors hover:border-primary"
                >
                  {outfit.name}
                </button>
              ))}
            </div>
            {selectedPlan?.outfit_id ? (
              <Button
                variant="danger"
                size="sm"
                loading={false}
                onClick={() => {
                  onClear(selectedDate);
                  setSelectedDate(null);
                }}
              >
                Clear day
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
