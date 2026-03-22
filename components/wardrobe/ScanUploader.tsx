"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { WardrobeItem } from "@/types";

type ScanUploaderProps = {
  onScanComplete: (item: WardrobeItem) => void;
};

type UploadState = "idle" | "uploading" | "analyzing" | "review" | "saved";
type ReviewDraft = Omit<
  WardrobeItem,
  "id" | "user_id" | "created_at" | "ai_metadata" | "ai_analyzed"
> & { ai_metadata: Record<string, unknown> | null; ai_analyzed: boolean };

const emptyDraft: ReviewDraft = {
  image_url: "",
  name: "",
  category: "tops",
  subcategory: "",
  colors: [],
  pattern: "solid",
  material_tags: [],
  season_tags: [],
  occasion_tags: [],
  brand: null,
  ai_metadata: null,
  ai_analyzed: true,
};

export function ScanUploader({ onScanComplete }: ScanUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  const previewImageUrl = useMemo(() => reviewDraft.image_url, [reviewDraft.image_url]);

  const parseCsv = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);

  async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Unable to read image file."));
      reader.readAsDataURL(file);
    });
  }

  async function handleScan(file: File) {
    setError(null);
    setState("uploading");
    setUploadProgress(0);

    for (let step = 1; step <= 10; step += 1) {
      await new Promise((resolve) => setTimeout(resolve, 90));
      setUploadProgress(step * 10);
    }

    const imageDataUrl = await fileToDataUrl(file);
    setState("analyzing");

    const scanResponse = await fetch("/api/wardrobe/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: imageDataUrl, aiAnalyzed: false }),
    });
    const scanJson = (await scanResponse.json()) as {
      result?: Partial<WardrobeItem>;
      error?: string;
    };

    if (!scanResponse.ok || !scanJson.result) {
      if (scanJson.error === "invalid_image") {
        setError("Please upload a clear photo showing exactly one clothing item.");
      } else {
        setError(
          scanJson.error ??
            "We could not analyze this image. Please upload a clear photo showing one clothing item."
        );
      }
      setState("idle");
      return;
    }

    setReviewDraft({
      ...emptyDraft,
      ...scanJson.result,
      image_url: imageDataUrl,
      ai_analyzed: true,
      ai_metadata: scanJson.result as Record<string, unknown>,
      brand: scanJson.result.brand ?? null,
      colors: Array.isArray(scanJson.result.colors) ? scanJson.result.colors : [],
      material_tags: Array.isArray(scanJson.result.material_tags) ? scanJson.result.material_tags : [],
      season_tags: Array.isArray(scanJson.result.season_tags) ? scanJson.result.season_tags : [],
      occasion_tags: Array.isArray(scanJson.result.occasion_tags) ? scanJson.result.occasion_tags : [],
    });
    setState("review");
  }

  async function handleSave() {
    setError(null);
    const response = await fetch("/api/wardrobe/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewDraft),
    });
    const json = (await response.json()) as { item?: WardrobeItem; error?: string };

    if (!response.ok || !json.item) {
      setError(json.error ?? "Unable to save item.");
      return;
    }

    onScanComplete(json.item);
    setState("saved");
  }

  return (
    <Card padding="lg" hoverable={false}>
      {state === "idle" ? (
        <div
          onDrop={async (event) => {
            event.preventDefault();
            const droppedFile = event.dataTransfer.files?.[0];
            if (droppedFile) await handleScan(droppedFile);
          }}
          onDragOver={(event) => event.preventDefault()}
          className="rounded-xl border border-dashed border-border bg-white p-8 text-center shadow-[0_14px_32px_-28px_rgba(31,27,22,0.45)]"
        >
          <p className="text-text-primary">Drag and drop a clothing photo here.</p>
          <p className="mt-1 text-sm text-text-secondary">Or click below to upload.</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => e.target.files?.[0] && (await handleScan(e.target.files[0]))} />
          <div className="mt-4">
            <Button variant="secondary" size="md" loading={false} onClick={() => inputRef.current?.click()}>
              Choose image
            </Button>
          </div>
        </div>
      ) : null}

      {state === "uploading" ? (
        <div>
          <p className="text-sm text-text-secondary">Uploading to storage...</p>
          <progress className="mt-3 h-2 w-full overflow-hidden rounded-full" value={uploadProgress} max={100} />
        </div>
      ) : null}
      {state === "analyzing" ? <div className="flex items-center gap-3"><LoadingSpinner size="md" /><p className="text-text-secondary">AI is analyzing your item...</p></div> : null}

      {state === "review" ? (
        <div className="space-y-4">
          {previewImageUrl ? (
            <div className="relative h-48 w-full overflow-hidden rounded-xl">
              <Image src={previewImageUrl} alt="Scanned item preview" fill className="object-cover" unoptimized />
            </div>
          ) : null}
          <input value={reviewDraft.name} onChange={(e) => setReviewDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <input value={reviewDraft.subcategory} onChange={(e) => setReviewDraft((p) => ({ ...p, subcategory: e.target.value }))} placeholder="Subcategory" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <input value={reviewDraft.colors.join(", ")} onChange={(e) => setReviewDraft((p) => ({ ...p, colors: parseCsv(e.target.value) }))} placeholder="Colors (comma separated)" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <input value={reviewDraft.material_tags.join(", ")} onChange={(e) => setReviewDraft((p) => ({ ...p, material_tags: parseCsv(e.target.value) }))} placeholder="Material tags (comma separated)" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <input value={reviewDraft.season_tags.join(", ")} onChange={(e) => setReviewDraft((p) => ({ ...p, season_tags: parseCsv(e.target.value) }))} placeholder="Season tags (comma separated)" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <input value={reviewDraft.occasion_tags.join(", ")} onChange={(e) => setReviewDraft((p) => ({ ...p, occasion_tags: parseCsv(e.target.value) }))} placeholder="Occasion tags (comma separated)" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary" />
          <div className="flex gap-3">
            <Button variant="primary" size="md" loading={false} onClick={handleSave}>Save item</Button>
            <Button variant="ghost" size="md" loading={false} onClick={() => setState("idle")}>Cancel</Button>
          </div>
        </div>
      ) : null}

      {state === "saved" ? (
        <div className="text-center">
          <p className="text-success">Item saved successfully.</p>
          <p className="mt-1 text-sm text-text-secondary">You can scan another item now.</p>
          <div className="mt-4">
            <Button variant="primary" size="md" loading={false} onClick={() => { setReviewDraft(emptyDraft); setUploadProgress(0); setState("idle"); }}>
              Scan another
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
    </Card>
  );
}
