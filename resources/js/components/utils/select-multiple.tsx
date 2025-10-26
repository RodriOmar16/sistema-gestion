import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Multiple } from "@/types/typeCrud";

interface Props {
  opciones: Multiple[];
  seleccionados: Multiple[];
  setSeleccionados: (select:Multiple[]) => void;
}

export default function SelectMultiple({opciones, seleccionados, setSeleccionados}: Props) {

  //console.log("seleccionados: ", seleccionados)
  const toggleSeleccion = (id: number) => {
    const yaExiste = seleccionados.some((v) => v.id === id);
    if (yaExiste) {
      setSeleccionados(seleccionados.filter((v) => v.id !== id));
    } else {
      const nuevo = opciones.find((o) => o.id === id);
      if (nuevo) setSeleccionados([...seleccionados, nuevo]);
    }
  };


  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Mostrar opciones</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-64 overflow-y-auto w-64 p-2">
          <Command>
            {opciones.map((opcion) => (
              <CommandItem key={opcion.id} onSelect={() => toggleSeleccion(opcion.id)}>
                 <Checkbox checked={seleccionados.some((e) => e.id === opcion.id)} />
                <span className="ml-2">{opcion.nombre}</span>
              </CommandItem>
            ))}
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex gap-2 flex-wrap min-h-10 max-h-32 overflow-y-auto p-2 border rounded">
        {seleccionados.map((s) => {
            return (
              <Badge key={s.id} variant="secondary" className="flex items-center gap-1"
                onClick={() => {
                    setSeleccionados(seleccionados.filter((e:Multiple) => e.id !== s.id));
                  }}
              >{s.nombre} <X size={14} className="cursor-pointer"/>
              </Badge>
            );
          })
        }
      </div>
    </div>
  );
}
