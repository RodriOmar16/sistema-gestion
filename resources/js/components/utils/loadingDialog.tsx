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
import { Loader2 } from "lucide-react";
import React from "react"

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Loading({ open,onClose }: Props) {
  
  return (
    <div className="">
      <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
        <DialogContent
          className="border-l-4 p-4 text-black border-blue-300 dark:border-blue-800 bg-blue-100 dark:bg-blue-300"
          onInteractOutside={(e) => e.preventDefault()} // evita cierre al click fuera
          onEscapeKeyDown={(e) => e.preventDefault()}   // evita cierre con Escape
        >
          <DialogHeader>
            <DialogDescription className="text-gray-700 dark:text-gray-200">
              <div className="flex items-center text-black">
                <Loader2 size={30} className="animate-spin mr-2"/> Por favor, espere...
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  );
}
