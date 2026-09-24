"use client";

import { Button } from "@/components/ui/button.tsx";
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
import { Switch } from "@/components/ui/switch.tsx";
import { CopyButton } from "@/components/utils/buttons/CopyButton.tsx";
import { getPublicFimidaraEndpointsUsingUserToken } from "@/lib/api/fimidaraEndpoints";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { systemConstants } from "@/lib/definitions/system.ts";
import { useRequest } from "ahooks";
import {
  getFimidaraReadFileURL,
  stringifyFimidaraFilepath,
  type File,
  type ImageFormatEnum,
  type ImageResizeFitEnum,
  type ImageResizePositionEnum,
} from "fimidara";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const FIT_OPTIONS: Array<{
  value: ImageResizeFitEnum;
  description: string;
}> = [
  {
    value: "cover",
    description: "Fill both dimensions; crops overflow.",
  },
  {
    value: "contain",
    description: "Fit inside both dimensions; may letterbox.",
  },
  {
    value: "fill",
    description: "Stretch to exact size; may distort.",
  },
  {
    value: "inside",
    description: "As large as possible without exceeding either side.",
  },
  {
    value: "outside",
    description: "As small as possible while covering both sides.",
  },
];

const POSITION_OPTIONS: Array<{
  value: ImageResizePositionEnum;
  description: string;
}> = [
  { value: "centre", description: "Anchor to the center." },
  { value: "top", description: "Anchor to the top edge." },
  { value: "right top", description: "Anchor to the top-right corner." },
  { value: "right", description: "Anchor to the right edge." },
  { value: "right bottom", description: "Anchor to the bottom-right corner." },
  { value: "bottom", description: "Anchor to the bottom edge." },
  { value: "left bottom", description: "Anchor to the bottom-left corner." },
  { value: "left", description: "Anchor to the left edge." },
  { value: "left top", description: "Anchor to the top-left corner." },
  {
    value: "entropy",
    description: "Focus on the region with highest Shannon entropy.",
  },
  {
    value: "attention",
    description: "Focus on luminance, saturation, and skin-tone regions.",
  },
];

const FORMAT_OPTIONS: Array<{
  value: ImageFormatEnum | "original";
  description: string;
}> = [
  { value: "original", description: "Keep the source file format." },
  { value: "jpeg", description: "Convert to JPEG." },
  { value: "png", description: "Convert to PNG." },
  { value: "webp", description: "Convert to WebP." },
  { value: "avif", description: "Convert to AVIF." },
  { value: "gif", description: "Convert to GIF (still images)." },
  { value: "tiff", description: "Convert to TIFF." },
];

function SelectOptionLabel(props: { label: string; description: string }) {
  return (
    <>
      <span className="font-medium">{props.label}</span>
      <span className="text-xs text-muted-foreground text-wrap">
        {props.description}
      </span>
    </>
  );
}

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

/** Reduce W×H to a simple ratio label (e.g. 1920×1080 → "16:9"). */
function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatAspectRatioLabel(width: number, height: number): string {
  const divisor = gcd(width, height);
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);
  // Odd pixel sizes don't simplify cleanly — show a decimal instead.
  if (w > 50 || h > 50) {
    return `${(width / height).toFixed(4)}`;
  }
  return `${w}:${h}`;
}

function formatSizeAndAspect(
  width: number | undefined,
  height: number | undefined,
  label?: string
): string | null {
  if (!width || !height) return null;
  return `${width}×${height} · ${
    label ?? formatAspectRatioLabel(width, height)
  }`;
}

export interface ImageTransformPlaygroundProps {
  file: File;
  workspaceRootname: string;
}

export function ImageTransformPlayground(props: ImageTransformPlaygroundProps) {
  const { file, workspaceRootname } = props;
  const [controls, setControls] = useState<TransformControls>(defaultControls);
  const [applied, setApplied] = useState<TransformControls>(defaultControls);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [originalMeasured, setOriginalMeasured] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [transformedMeasured, setTransformedMeasured] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const filepath = stringifyFimidaraFilepath(file, workspaceRootname);

  const originalWidth = file.imageWidth ?? originalMeasured?.width;
  const originalHeight = file.imageHeight ?? originalMeasured?.height;
  const originalMeta = formatSizeAndAspect(
    originalWidth,
    originalHeight,
    // Prefer server-computed label when API dims are present.
    file.imageWidth && file.imageHeight ? file.aspectRatioLabel : undefined
  );

  const requestedWidth = parseOptionalPositiveInt(applied.width);
  const requestedHeight = parseOptionalPositiveInt(applied.height);
  const transformedWidth = transformedMeasured?.width ?? requestedWidth;
  const transformedHeight = transformedMeasured?.height ?? requestedHeight;
  const transformedMeta = formatSizeAndAspect(
    transformedWidth,
    transformedHeight
  );

  const pathHook = useRequest(async () => {
    const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
    const issueResult = await endpoints.presignedPaths.issuePresignedPath({
      fileId: file.resourceId,
      duration: 60 * 60,
    });
    return issueResult.path.startsWith("/")
      ? issueResult.path
      : `/${issueResult.path}`;
  });

  const originalUrl = useMemo(() => {
    if (!pathHook.data) return null;
    return getFimidaraReadFileURL({
      filepath: pathHook.data,
      serverURL: systemConstants.serverAddr,
    });
  }, [pathHook.data]);

  const transformedUrl = useMemo(() => {
    if (!pathHook.data) return null;
    const width = parseOptionalPositiveInt(applied.width);
    const height = parseOptionalPositiveInt(applied.height);
    return getFimidaraReadFileURL({
      filepath: pathHook.data,
      serverURL: systemConstants.serverAddr,
      width,
      height,
      fit: applied.fit || undefined,
      position: applied.position || undefined,
      background: applied.background.trim() || undefined,
      withoutEnlargement: applied.withoutEnlargement || undefined,
      format: applied.format === "original" ? undefined : applied.format,
    });
  }, [pathHook.data, applied]);

  const update = <K extends keyof TransformControls>(
    key: K,
    value: TransformControls[K]
  ) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div>
            <Button variant="link" size="sm" className="p-0">
              <Link
                href={kAppWorkspacePaths.file(
                  file.workspaceId,
                  file.resourceId
                )}
                className="flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back to file
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Image transform
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-prose">
          Live preview of on-the-fly resize and format conversion via image
          transformation query params.
        </p>
        <p className="text-xs text-muted-foreground break-all">
          <code className="font-mono">{filepath}</code>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoadError(null);
            setApplied({ ...controls });
          }}
        >
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectValue placeholder="Fit">
                    {(value: string | null) => value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-auto min-w-(--anchor-width) max-w-72">
                  {FIT_OPTIONS.map((fit) => (
                    <SelectItem key={fit.value} value={fit.value}>
                      <SelectOptionLabel
                        label={fit.value}
                        description={fit.description}
                      />
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
                  <SelectValue placeholder="Position">
                    {(value: string | null) => value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-auto min-w-(--anchor-width) max-w-72">
                  {POSITION_OPTIONS.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      <SelectOptionLabel
                        label={position.value}
                        description={position.description}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                className="font-mono uppercase"
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
                <SelectValue placeholder="Format">
                  {(value: string | null) => value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-auto min-w-(--anchor-width) max-w-72">
                {FORMAT_OPTIONS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <SelectOptionLabel
                      label={format.value}
                      description={format.description}
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="withoutEnlargement" className="flex-1">
              Without enlargement
            </Label>
            <Switch
              id="withoutEnlargement"
              checked={controls.withoutEnlargement}
              onCheckedChange={(checked) =>
                update("withoutEnlargement", checked)
              }
            />
          </div>

          {pathHook.error ? (
            <p className="text-sm text-destructive">
              Failed to prepare a readable URL for this file. Check that you can
              read it.
            </p>
          ) : null}
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={!pathHook.data || pathHook.loading}>
              Apply
            </Button>
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
              <div className="flex items-center justify-between gap-2">
                <Label>Request URL</Label>
                <CopyButton
                  text={transformedUrl}
                  variant="ghost"
                  size="icon-xs"
                />
              </div>
              <code className="font-mono break-all rounded-md border bg-muted/40 p-2 text-xs">
                {transformedUrl}
              </code>
            </div>
          ) : null}
        </form>

        <div className="flex flex-col gap-6 min-w-0">
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium">Transformed</h2>
              {transformedMeta ? (
                <p className="text-xs text-muted-foreground font-mono">
                  {transformedMeta}
                </p>
              ) : null}
            </div>
            <div className="flex min-h-64 items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
              {pathHook.loading ? (
                <p className="text-sm text-muted-foreground">
                  Preparing image…
                </p>
              ) : transformedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={transformedUrl}
                  src={transformedUrl}
                  alt="Transformed preview"
                  className="max-h-[36rem] max-w-full object-contain"
                  onError={() =>
                    setLoadError(
                      "Failed to load transformed image. Check that the file is readable and the server supports transforms."
                    )
                  }
                  onLoad={(event) => {
                    setLoadError(null);
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (naturalWidth > 0 && naturalHeight > 0) {
                      setTransformedMeasured({
                        width: naturalWidth,
                        height: naturalHeight,
                      });
                    }
                  }}
                />
              ) : null}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium">Original</h2>
              {originalMeta ? (
                <p className="text-xs text-muted-foreground font-mono">
                  {originalMeta}
                </p>
              ) : file.imageDimensionsStatus === "pending" ? (
                <p className="text-xs text-muted-foreground">
                  Dimensions pending…
                </p>
              ) : null}
            </div>
            <div className="flex min-h-40 items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
              {originalUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="Original image"
                  className="max-h-64 max-w-full object-contain"
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (naturalWidth > 0 && naturalHeight > 0) {
                      setOriginalMeasured({
                        width: naturalWidth,
                        height: naturalHeight,
                      });
                    }
                  }}
                />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
