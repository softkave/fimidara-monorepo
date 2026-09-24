import { TransferProgressList } from "@/components/utils/TransferProgress";
import IconButton from "@/components/utils/buttons/IconButton.tsx";
import PageDrawer from "@/components/utils/page/PageDrawer";
import { KeyValueKeys, useKvStore } from "@/lib/hooks/kvStore.ts";
import {
  ITransferProgress,
  isTransferInProgress,
} from "@/lib/hooks/useTransferProgress";
import { useToggle } from "ahooks";
import { isEqual, map } from "lodash-es";
import { FC, Fragment } from "react";
import { FiDownload } from "react-icons/fi";

export interface UploadingFilesProgressButtonProps {}

function isTransferProgressKey(key: string) {
  return key.startsWith(`${KeyValueKeys.TransferProgress}_`);
}

export const UploadingFilesProgressButton: FC<
  UploadingFilesProgressButtonProps
> = () => {
  const [showList, showListHook] = useToggle();
  // Single selector so we don't close over a stale progressKeys list from a
  // prior render (which made the badge stuck at 0 until the next progress tick).
  const pendingCount = useKvStore((state) => {
    let count = 0;
    for (const [key, value] of Object.entries(state.items)) {
      if (
        isTransferProgressKey(key) &&
        isTransferInProgress(value as ITransferProgress | undefined)
      ) {
        count += 1;
      }
    }
    return count;
  });

  return (
    <Fragment>
      {showList && (
        <UploadingFilesProgressDrawer onClose={() => showListHook.toggle()} />
      )}
      <IconButton
        asChild
        icon={<FiDownload />}
        title={`Uploading files progress...`}
        onClick={() => showListHook.toggle()}
        className="min-w-12 w-fit px-2"
      >
        <span className="inline-block ml-2 text-secondary">{pendingCount}</span>
      </IconButton>
    </Fragment>
  );
};

export interface UploadingFilesProgressDrawerProps {
  onClose: () => void;
}

export const UploadingFilesProgressDrawer: FC<
  UploadingFilesProgressDrawerProps
> = (props) => {
  const { onClose } = props;
  const { progressKeys } = useTransferProgressKeys();
  return (
    <PageDrawer open title="Uploading files progress" onClose={onClose}>
      <TransferProgressList progressKeys={progressKeys} />
    </PageDrawer>
  );
};

function useTransferProgressKeys() {
  const progressKeys = useKvStore(
    (state) =>
      map(state.items, (_value, key) => key).filter(isTransferProgressKey),
    isEqual
  );

  return { progressKeys };
}
