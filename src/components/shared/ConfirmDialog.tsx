import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open:          boolean;                      // ✅ controlled open state
  onOpenChange:  (open: boolean) => void;
  title:         string;
  description:   string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      "default" | "destructive";
  onConfirm:     () => void;
  isLoading?:    boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel  = "Batal",
  variant      = "default",
  onConfirm,
  isLoading    = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              variant === "destructive" &&
                "bg-red-600 hover:bg-red-700 focus:ring-red-600 dark:bg-red-700 dark:hover:bg-red-800",
            )}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
