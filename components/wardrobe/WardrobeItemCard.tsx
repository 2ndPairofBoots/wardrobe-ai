"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { WardrobeItem } from "@/types";

export interface WardrobeItemCardProps {
  item: WardrobeItem;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (id: string) => void;
}

const colorDotClassByName: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border border-border",
  gray: "bg-gray-500",
  grey: "bg-gray-500",
  silver: "bg-gray-300",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  blue: "bg-blue-500",
  navy: "bg-blue-900",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  brown: "bg-amber-800",
  beige: "bg-amber-100 border border-border",
  cream: "bg-amber-50 border border-border",
};

export function WardrobeItemCard({ item, onEdit, onDelete }: WardrobeItemCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<WardrobeItem>(item);

  const normalizedColors = useMemo(() => item.colors.map((color) => color.toLowerCase()), [item.colors]);
  const parseCsv = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <Card padding="md" hoverable={true} className="space-y-4">
      <div className="relative h-48 overflow-hidden rounded-xl bg-background">
        {imageLoading ? <div className="absolute inset-0 animate-pulse bg-border" /> : null}
        {imageError ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            Image unavailable
          </div>
        ) : (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-medium text-text-primary">{item.name}</h3>
          <Badge variant="default">{item.category}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {normalizedColors.length > 0 ? (
            normalizedColors.map((color) => (
              <span
                key={`${item.id}-${color}`}
                title={color}
                className={`h-3 w-3 rounded-full ${colorDotClassByName[color] ?? "bg-border"}`}
              />
            ))
          ) : (
            <span className="text-xs text-text-muted">No colors detected</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={false}
          onClick={() => {
            setDraft(item);
            setEditOpen(true);
          }}
        >
          Edit
        </Button>
        <Button variant="danger" size="sm" loading={false} onClick={() => onDelete(item.id)}>
          Delete
        </Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit item details">
        <div className="space-y-3">
          <input
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Item name"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <select
            value={draft.category}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                category: event.target.value as WardrobeItem["category"],
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          >
            <option value="tops">tops</option>
            <option value="bottoms">bottoms</option>
            <option value="shoes">shoes</option>
            <option value="outerwear">outerwear</option>
            <option value="accessories">accessories</option>
          </select>
          <input
            value={draft.subcategory}
            onChange={(event) => setDraft((prev) => ({ ...prev, subcategory: event.target.value }))}
            placeholder="Subcategory"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <select
            value={draft.pattern}
            onChange={(event) => setDraft((prev) => ({ ...prev, pattern: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          >
            <option value="solid">solid</option>
            <option value="striped">striped</option>
            <option value="checked">checked</option>
            <option value="floral">floral</option>
            <option value="graphic">graphic</option>
            <option value="other">other</option>
          </select>
          <input
            value={draft.colors.join(", ")}
            onChange={(event) => setDraft((prev) => ({ ...prev, colors: parseCsv(event.target.value) }))}
            placeholder="Colors (comma separated)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <input
            value={draft.material_tags.join(", ")}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, material_tags: parseCsv(event.target.value) }))
            }
            placeholder="Material tags (comma separated)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <input
            value={draft.season_tags.join(", ")}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, season_tags: parseCsv(event.target.value) }))
            }
            placeholder="Season tags (comma separated)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <input
            value={draft.occasion_tags.join(", ")}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, occasion_tags: parseCsv(event.target.value) }))
            }
            placeholder="Occasion tags (comma separated)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <input
            value={draft.brand ?? ""}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                brand: event.target.value.trim() ? event.target.value : null,
              }))
            }
            placeholder="Brand (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              loading={false}
              onClick={() => {
                onEdit(draft);
                setEditOpen(false);
              }}
            >
              Save changes
            </Button>
            <Button variant="ghost" size="md" loading={false} onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
