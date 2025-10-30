import * as React from "react"
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { convertirFechaBarrasGuiones } from "@/utils"

function crearFechaLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // sin hora, sin desfase
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface Props{
  fecha: string;
  setFecha: (date:string) => void
}

export function DatePicker({fecha,setFecha}:Props) {
  const [open, setOpen]   = React.useState(false);
  const [date, setDate]   = useState(fecha? crearFechaLocal(convertirFechaBarrasGuiones(fecha)) : new Date())
  
  function aplicarMascaraFecha(valor: string): string {
    const limpio = valor.replace(/\D/g, '').slice(0, 8); // solo números
    let resultado = '';

    if (limpio.length >= 1) resultado += limpio.slice(0, 2);
    if (limpio.length >= 3) resultado += '/' + limpio.slice(2, 4);
    if (limpio.length >= 5) resultado += '/' + limpio.slice(4, 8);

    return resultado;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={fecha}
          placeholder="dd/mm/yyyy"
          className="bg-background pr-10"
          onChange={(e) => {
            const formateado = aplicarMascaraFecha(e.target.value);
            setFecha(formateado);
            const date = new Date(convertirFechaBarrasGuiones(formateado));
            if (isValidDate(date)) setDate(date);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Seleccionar fecha</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date??new Date);
                setFecha(date?date.toLocaleDateString() : '');
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
