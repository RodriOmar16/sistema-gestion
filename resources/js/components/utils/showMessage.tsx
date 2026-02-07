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
  /*const colorClass: Record<'success' | 'error' | 'warning' | 'info', string> = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800',
  };*/
  const colorClass: Record<'success' | 'error' | 'warning' | 'info', string> = {
    success: 'border-green-500 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-900 dark:text-green-300',
    error: 'border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900 dark:text-red-300',
    warning: 'border-orange-500 bg-orange-100 text-orange-800 dark:border-orange-500 dark:bg-orange-800 dark:text-orange-300',
    info: 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-900 dark:text-blue-300',
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
            <DialogDescription className="text-gray-700 dark:text-gray-200">
              {text}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/*<DialogClose asChild>
              <Button type="button" variant="outline">Cerrar</Button>
            </DialogClose>*/}
            <DialogClose asChild>
              <Button
                type="button"
                className="
                  px-4 py-2 rounded-md font-medium
                  bg-blue-700 text-white hover:bg-sky-400 hover:text-black
                  dark:bg-sky-400 dark:text-black dark:hover:bg-blue-700 dark:hover:text-white"
              >
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
