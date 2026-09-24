"use client";

import {
  MfdocEndpointProgressEvent as FimidaraEndpointProgressEvent,
  IMultipartUploadHookFnParams,
} from "fimidara";
import { merge, uniq } from "lodash-es";
import React from "react";
import { KeyValueDynamicKeys, useKvStore } from "./kvStore";

export type TransferProgressStatus = "uploading" | "complete" | "error";

export interface ITransferProgress {
  completedParts: number;
  estimatedNumParts: number;
  totalSize: number;
  startMs: number;
  percentComplete: number;
  sizeCompleted: number;
  status: TransferProgressStatus;
  fileId?: string;
  workspaceId?: string;
  doneMs?: number;
}

export function isTransferInProgress(value: ITransferProgress | undefined) {
  if (!value) {
    return false;
  }

  return value.status === "uploading";
}

export function useTransferProgressHandler(inputIdentifiers: string[] = []) {
  const [identifiers, setIdentifiers] = React.useState(inputIdentifiers);

  const setProgress = React.useCallback(
    (
      identifier: string,
      partParams: IMultipartUploadHookFnParams,
      otherParams?: {
        totalSize: number;
      }
    ) => {
      useKvStore
        .getState()
        .setWithFn(
          KeyValueDynamicKeys.getTransferProgress(identifier),
          (maybeProgress: ITransferProgress | undefined) => {
            // Stay "uploading" until markComplete — parts can hit 100% before
            // the multipart complete call finishes.
            const status: TransferProgressStatus =
              maybeProgress?.status === "complete"
                ? "complete"
                : maybeProgress?.status === "error"
                ? "error"
                : "uploading";

            const progress: ITransferProgress = {
              completedParts: (maybeProgress?.completedParts ?? 0) + 1,
              estimatedNumParts: partParams.estimatedNumParts,
              totalSize:
                otherParams?.totalSize ?? maybeProgress?.totalSize ?? 0,
              startMs: maybeProgress?.startMs ?? Date.now(),
              sizeCompleted: partParams.sizeCompleted,
              percentComplete: partParams.percentComplete,
              status,
              fileId: maybeProgress?.fileId,
              workspaceId: maybeProgress?.workspaceId,
              doneMs: maybeProgress?.doneMs,
            };
            return progress;
          }
        );
    },
    []
  );

  const mergeProgress = React.useCallback(
    (identifier: string, evt: Partial<FimidaraEndpointProgressEvent>) => {
      const p = useKvStore
        .getState()
        .get(KeyValueDynamicKeys.getTransferProgress(identifier));

      if (p) {
        const merged = merge({}, p, evt);
        useKvStore
          .getState()
          .set(KeyValueDynamicKeys.getTransferProgress(identifier), merged);
      }
    },
    []
  );

  const getProgressHandler = React.useCallback(
    (params: { identifier: string; totalSize: number }) => {
      setIdentifiers((ids) => uniq(ids.concat(params.identifier)));

      // Seed an uploading entry so the drawer/form show the file immediately.
      useKvStore.getState().setWithFn(
        KeyValueDynamicKeys.getTransferProgress(params.identifier),
        (maybeProgress: ITransferProgress | undefined) => {
          if (maybeProgress) {
            return maybeProgress;
          }

          return {
            completedParts: 0,
            estimatedNumParts: 0,
            totalSize: params.totalSize,
            startMs: Date.now(),
            sizeCompleted: 0,
            percentComplete: 0,
            status: "uploading" as const,
          };
        }
      );

      return (partParams: IMultipartUploadHookFnParams) => {
        setProgress(params.identifier, partParams, {
          totalSize: params.totalSize,
        });
      };
    },
    [setProgress]
  );

  const markComplete = React.useCallback(
    (
      identifier: string,
      meta: { fileId: string; workspaceId: string; totalSize?: number }
    ) => {
      useKvStore
        .getState()
        .setWithFn(
          KeyValueDynamicKeys.getTransferProgress(identifier),
          (maybeProgress: ITransferProgress | undefined) => {
            const totalSize =
              meta.totalSize ??
              maybeProgress?.totalSize ??
              maybeProgress?.sizeCompleted ??
              0;

            return {
              completedParts:
                maybeProgress?.completedParts ??
                maybeProgress?.estimatedNumParts ??
                1,
              estimatedNumParts:
                maybeProgress?.estimatedNumParts ??
                maybeProgress?.completedParts ??
                1,
              totalSize,
              startMs: maybeProgress?.startMs ?? Date.now(),
              sizeCompleted: totalSize,
              percentComplete: 100,
              status: "complete" as const,
              fileId: meta.fileId,
              workspaceId: meta.workspaceId,
              doneMs: Date.now(),
            };
          }
        );
    },
    []
  );

  const setOpError = React.useCallback((identifier: string, error: unknown) => {
    useKvStore.getState().set(KeyValueDynamicKeys.getOpError(identifier), error);
    useKvStore
      .getState()
      .setWithFn(
        KeyValueDynamicKeys.getTransferProgress(identifier),
        (maybeProgress: ITransferProgress | undefined) => {
          if (!maybeProgress) {
            return {
              completedParts: 0,
              estimatedNumParts: 0,
              totalSize: 0,
              startMs: Date.now(),
              sizeCompleted: 0,
              percentComplete: 0,
              status: "error" as const,
            };
          }

          return { ...maybeProgress, status: "error" as const };
        }
      );
  }, []);

  const clearProgress = React.useCallback((identifier: string) => {
    useKvStore
      .getState()
      .remove([
        KeyValueDynamicKeys.getTransferProgress(identifier),
        KeyValueDynamicKeys.getOpError(identifier),
      ]);
    setIdentifiers((ids) => ids.filter((id) => id !== identifier));
  }, []);

  return {
    identifiers,
    getProgressHandler,
    setOpError,
    setProgress,
    mergeProgress,
    markComplete,
    clearProgress,
  };
}

export function useTransferProgress(identifier?: string, progressKey?: string) {
  const progress = useKvStore((state) => {
    return identifier
      ? state.get<ITransferProgress>(
          KeyValueDynamicKeys.getTransferProgress(identifier)
        )
      : progressKey
      ? state.get<ITransferProgress>(progressKey)
      : undefined;
  });
  const error = useKvStore((state) => {
    return identifier
      ? state.get<unknown>(KeyValueDynamicKeys.getOpError(identifier))
      : undefined;
  });

  return { progress, error };
}
