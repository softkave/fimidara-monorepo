import { ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog.tsx";

export interface IUseDeleteModalProps {
  title: ReactNode;
  description?: ReactNode;
  onDelete: () => void | Promise<void>;
}

export function useDeleteModal(props: IUseDeleteModalProps) {
  const { title, description, onDelete } = props;

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const node = show && (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="break-words">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            loading={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await onDelete();
              } finally {
                setLoading(false);
                setShow(false);
              }
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { show, node, setShow };
}
