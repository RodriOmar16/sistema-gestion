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
  onClose: () => void;
  title: string;
  text: string;
  color: 'success' | 'error' | 'warning' | 'info' | string;
  icon?: string;
}

export default function ShowMessage({ open, title, text, color, icon, onClose }: Props) {
  const colorClass: Record<'success' | 'error' | 'warning' | 'info', string> = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800',
  };

  const fallbackColor = 'warning';
  const selectedColor = colorClass[color as keyof typeof colorClass] ?? colorClass[fallbackColor];

  return (
    <div className="">
      <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
        <DialogContent className={`border-l-4 p-4 ${selectedColor}`}>
          <DialogHeader>
            {
              title ? (<DialogTitle>{title}</DialogTitle>) : ( <></> )
            }
            <DialogDescription>{text}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
