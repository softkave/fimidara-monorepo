"use client";

import { KeyValueDynamicKeys } from "@/lib/hooks/kvStore.ts";
import { useTransferProgress } from "@/lib/hooks/useTransferProgress";
import { add, formatDistanceToNow } from "date-fns";
import { identity, uniqBy } from "lodash-es";
import { Dot } from "lucide-react";
import pb from "pretty-bytes";
import { Progress } from "../ui/progress.tsx";
import FormError from "./form/FormError";
import ItemList from "./list/ItemList";

export interface ITransferProgressProps {
  identifier?: string;
  progressKey: string;
}

export interface ITransferProgressListProps {
  identifiers?: string[];
  progressKeys?: string[];
}

export function TransferProgress(props: ITransferProgressProps) {
  const { identifier, progressKey } = props;
  const progressHook = useTransferProgress(identifier, progressKey);
  const elapsedMs = progressHook.progress?.startMs
    ? Date.now() - progressHook.progress.startMs
    : 0;
  const elapsedSeconds = elapsedMs ? elapsedMs / 1000 : 0;
  const loaded = progressHook.progress?.sizeCompleted ?? 0;
  const rate = loaded && elapsedSeconds ? loaded / elapsedSeconds : 0;
  const total = progressHook.progress?.totalSize ?? 0;
  const estimatedTime = total && rate ? total / rate : undefined;
  const percent = progressHook.progress?.percentComplete ?? 0;

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
  const { identifiers, progressKeys } = props;
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
          />
        );
      }}
      getId={identity}
      space="sm"
      emptyMessage="No files are being uploaded"
    />
  );
}
