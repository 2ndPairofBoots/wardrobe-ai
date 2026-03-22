"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Outfit, WardrobeItem } from "@/types";

export interface OutfitCardProps {
  outfit: Outfit;
  items: WardrobeItem[];
  onEdit: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
  onAssignToPlanner: (outfit: Outfit) => void;
}

export function OutfitCard({ outfit, items, onEdit, onDelete, onAssignToPlanner }: OutfitCardProps) {
  const thumbnailItems = items.slice(0, 5);

  return (
    <Card padding="md" hoverable={true}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium text-text-primary">{outfit.name}</h3>
          <div className="flex flex-wrap items-center gap-1">
            {outfit.occasion ? <Badge variant="default">{outfit.occasion}</Badge> : null}
            {outfit.season ? <Badge variant="default">{outfit.season}</Badge> : null}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {thumbnailItems.map((item) => (
            <div key={item.id} className="relative h-16 overflow-hidden rounded-lg border border-border">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
            </div>
          ))}
          {thumbnailItems.length === 0 ? (
            <div className="col-span-5 rounded-lg border border-border bg-background p-3 text-sm text-text-secondary">
              No item previews available.
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" loading={false} onClick={() => onEdit(outfit)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" loading={false} onClick={() => onDelete(outfit.id)}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" loading={false} onClick={() => onAssignToPlanner(outfit)}>
            Assign to planner
          </Button>
        </div>
      </div>
    </Card>
  );
}
