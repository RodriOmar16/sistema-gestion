import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from "react"

interface Props {
  open: boolean;
  text: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ModalConfirmar({ open, text, onSubmit, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogDescription>{text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">No</Button>
          </DialogClose>
          <Button onClick={onSubmit} type="button">Sí</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
