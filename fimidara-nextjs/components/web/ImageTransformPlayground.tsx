"use client";

import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { systemConstants } from "@/lib/definitions/system.ts";
import {
  getFimidaraReadFileURL,
  type ImageFormatEnum,
  type ImageResizeFitEnum,
  type ImageResizePositionEnum,
} from "fimidara";
import { useMemo, useState } from "react";

const FIT_OPTIONS: ImageResizeFitEnum[] = [
  "cover",
  "contain",
  "fill",
  "inside",
  "outside",
];

const POSITION_OPTIONS: ImageResizePositionEnum[] = [
  "centre",
  "top",
  "right top",
  "right",
  "right bottom",
  "bottom",
  "left bottom",
  "left",
  "left top",
  "entropy",
  "attention",
];

const FORMAT_OPTIONS: Array<ImageFormatEnum | "original"> = [
  "original",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "tiff",
];

type TransformControls = {
  width: string;
  height: string;
  fit: ImageResizeFitEnum | "";
  position: ImageResizePositionEnum | "";
  background: string;
  withoutEnlargement: boolean;
  format: ImageFormatEnum | "original";
};

const defaultControls: TransformControls = {
  width: "600",
  height: "400",
  fit: "cover",
  position: "centre",
  background: "#ffffff",
  withoutEnlargement: true,
  format: "webp",
};

function parseOptionalPositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

export function ImageTransformPlayground() {
  const filepath = systemConstants.imageTransformDemoFilepath;
  const [controls, setControls] = useState<TransformControls>(defaultControls);
  const [applied, setApplied] = useState<TransformControls>(defaultControls);
  const [loadError, setLoadError] = useState<string | null>(null);

  const originalUrl = useMemo(() => {
    if (!filepath) return null;
    return getFimidaraReadFileURL({
      filepath,
      serverURL: systemConstants.serverAddr,
    });
  }, [filepath]);

  const transformedUrl = useMemo(() => {
    if (!filepath) return null;
    const width = parseOptionalPositiveInt(applied.width);
    const height = parseOptionalPositiveInt(applied.height);
    return getFimidaraReadFileURL({
      filepath,
      serverURL: systemConstants.serverAddr,
      width,
      height,
      fit: applied.fit || undefined,
      position: applied.position || undefined,
      background: applied.background.trim() || undefined,
      withoutEnlargement: applied.withoutEnlargement || undefined,
      format: applied.format === "original" ? undefined : applied.format,
    });
  }, [filepath, applied]);

  const update = <K extends keyof TransformControls>(
    key: K,
    value: TransformControls[K]
  ) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  if (!filepath) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Image transform
        </h1>
        <p className="text-sm text-muted-foreground max-w-prose">
          Set{" "}
          <code className="font-mono text-xs">
            NEXT_PUBLIC_IMAGE_TRANSFORM_DEMO_FILEPATH
          </code>{" "}
          to a publicly readable image filepath in the fimidara workspace (for
          example{" "}
          <code className="font-mono text-xs">
            /fimidara/public/demo.jpg
          </code>
          ), then restart the Next.js app.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Image transform
        </h1>
        <p className="text-sm text-muted-foreground max-w-prose">
          Live preview of on-the-fly resize and format conversion via{" "}
          <code className="font-mono text-xs">readFile</code> query
          params.
        </p>
        <p className="text-xs text-muted-foreground break-all">
          Source:{" "}
          <code className="font-mono">{filepath}</code>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoadError(null);
            setApplied({ ...controls });
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              min={1}
              placeholder="e.g. 600"
              value={controls.width}
              onChange={(e) => update("width", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              min={1}
              placeholder="e.g. 400"
              value={controls.height}
              onChange={(e) => update("height", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Fit</Label>
            <Select
              value={controls.fit || undefined}
              onValueChange={(value) => {
                if (value == null) return;
                update("fit", value as ImageResizeFitEnum);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Fit" />
              </SelectTrigger>
              <SelectContent>
                {FIT_OPTIONS.map((fit) => (
                  <SelectItem key={fit} value={fit}>
                    {fit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Position</Label>
            <Select
              value={controls.position || undefined}
              onValueChange={(value) => {
                if (value == null) return;
                update("position", value as ImageResizePositionEnum);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="background">Background</Label>
            <div className="flex items-center gap-2">
              <Input
                id="background"
                type="color"
                className="w-12 p-1"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(controls.background)
                    ? controls.background
                    : "#ffffff"
                }
                onChange={(e) => update("background", e.target.value)}
              />
              <Input
                value={controls.background}
                placeholder="#ffffff"
                onChange={(e) => update("background", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Format</Label>
            <Select
              value={controls.format}
              onValueChange={(value) => {
                if (value == null) return;
                update("format", value as ImageFormatEnum | "original");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="withoutEnlargement"
              checked={controls.withoutEnlargement}
              onCheckedChange={(checked) =>
                update("withoutEnlargement", checked === true)
              }
            />
            <Label htmlFor="withoutEnlargement">Without enlargement</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setControls(defaultControls);
                setApplied(defaultControls);
                setLoadError(null);
              }}
            >
              Reset
            </Button>
          </div>

          {transformedUrl ? (
            <div className="flex flex-col gap-2">
              <Separator />
              <Label>Request URL</Label>
              <code className="font-mono break-all rounded-md border bg-muted/40 p-2 text-xs">
                {transformedUrl}
              </code>
            </div>
          ) : null}
        </form>

        <div className="flex flex-col gap-6 min-w-0">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Transformed</h2>
            <div className="flex min-h-64 items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
              {transformedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={transformedUrl}
                  src={transformedUrl}
                  alt="Transformed preview"
                  className="max-h-[36rem] max-w-full object-contain"
                  onError={() =>
                    setLoadError(
                      "Failed to load transformed image. Check that the file is publicly readable and the server supports transforms."
                    )
                  }
                  onLoad={() => setLoadError(null)}
                />
              ) : null}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Original</h2>
            <div className="flex min-h-40 items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
              {originalUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="Original image"
                  className="max-h-64 max-w-full object-contain"
                />
              ) : null}
            </div>
          </section>

          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
