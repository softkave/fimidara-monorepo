import { ImageTransformPlayground } from "@/components/web/ImageTransformPlayground.tsx";
import { MaybeLayout } from "@/components/utils/MaybeLayout.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "fimidara — image transform",
  description: "Playground for on-the-fly fimidara image transforms",
};

export default function ImageTransformPage() {
  return (
    <MaybeLayout
      isDocs={false}
      shouldRedirectToWorkspace={false}
      contentClassName="max-w-6xl"
    >
      <ImageTransformPlayground />
    </MaybeLayout>
  );
}
