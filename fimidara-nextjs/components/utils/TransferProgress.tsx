"use client";

import { Progress } from "../ui/progress.tsx";
import { Button } from "@/components/ui/button.tsx";
import { KeyValueDynamicKeys, useKvStore } from "@/lib/hooks/kvStore.ts";
import { useTransferProgress } from "@/lib/hooks/useTransferProgress";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { add, formatDistanceToNow } from "date-fns";
import { identity, uniqBy } from "lodash-es";
import { CheckCircle2, Dot, X } from "lucide-react";
import Link from "next/link";
import pb from "pretty-bytes";
import FormError from "./form/FormError";
import ItemList from "./list/ItemList";

export interface ITransferProgressProps {
  identifier?: string;
  progressKey: string;
  onDismiss?: (identifier: string) => void;
}

export interface ITransferProgressListProps {
  identifiers?: string[];
  progressKeys?: string[];
  onDismiss?: (identifier: string) => void;
}

export function TransferProgress(props: ITransferProgressProps) {
  const { identifier, progressKey, onDismiss } = props;
  const progressHook = useTransferProgress(identifier, progressKey);
  const progress = progressHook.progress;

  if (!progress && !progressHook.error) {
    return null;
  }

  const isComplete = progress?.status === "complete";
  const elapsedMs = progress?.startMs ? Date.now() - progress.startMs : 0;
  const elapsedSeconds = elapsedMs ? elapsedMs / 1000 : 0;
  const loaded = progress?.sizeCompleted ?? 0;
  const rate = loaded && elapsedSeconds ? loaded / elapsedSeconds : 0;
  const total = progress?.totalSize ?? 0;
  const estimatedTime = total && rate ? total / rate : undefined;
  const percent = progress?.percentComplete ?? 0;
  const fileHref =
    progress?.fileId && progress?.workspaceId
      ? kAppWorkspacePaths.file(progress.workspaceId, progress.fileId)
      : undefined;

  const dismiss = () => {
    if (!identifier) {
      return;
    }
    if (onDismiss) {
      onDismiss(identifier);
      return;
    }
    useKvStore
      .getState()
      .remove([
        KeyValueDynamicKeys.getTransferProgress(identifier),
        KeyValueDynamicKeys.getOpError(identifier),
      ]);
  };

  if (isComplete) {
    return (
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <span className="break-words">{identifier}</span>
            </div>
            <p className="text-sm text-secondary">Upload complete</p>
            {fileHref ? (
              <Link
                href={fileHref}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Open file
              </Link>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Dismiss"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="text-secondary break-words">{identifier}</span>
      <Progress value={percent} />
      <div className="space-x-2">
        <span className="text-secondary">
          {pb(loaded)} of {pb(total)}
        </span>
        <Dot className="h-4 w-4 inline text-secondary" />
        <span className="text-secondary">{pb(rate)}/s</span>
        <Dot className="h-4 w-4 inline text-secondary" />
        <span className="text-secondary">
          {estimatedTime
            ? formatDistanceToNow(add(new Date(), { seconds: estimatedTime }))
            : "Estimated time unknown"}
        </span>
      </div>
      {progressHook.error ? (
        <FormError visible enrich error={progressHook.error as any} />
      ) : null}
    </div>
  );
}

interface TransferId {
  key: string;
  identifier?: string;
}

export function TransferProgressList(props: ITransferProgressListProps) {
  const { identifiers, progressKeys, onDismiss } = props;
  const fromIds = identifiers?.map(
    (identifier): TransferId => ({
      identifier,
      key: KeyValueDynamicKeys.getTransferProgress(identifier),
    })
  );
  const fromKeys = progressKeys?.map(
    (key): TransferId => ({
      key,
      identifier: KeyValueDynamicKeys.getTransferProgressIdentifier(key),
    })
  );
  const itemList = uniqBy(
    ([] as Array<TransferId>).concat(fromIds || [], fromKeys || []),
    (item) => item.identifier + item.key
  );

  return (
    <ItemList
      bordered={false}
      items={itemList}
      renderItem={(item) => {
        return (
          <TransferProgress
            key={item.key}
            identifier={item.identifier}
            progressKey={item.key}
            onDismiss={onDismiss}
          />
        );
      }}
      getId={identity}
      space="sm"
      emptyMessage="No files are being uploaded"
    />
  );
}
