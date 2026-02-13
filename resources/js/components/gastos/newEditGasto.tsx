import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Turno } from "@/types/typeCrud";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  turno?: Turno;
  onSubmit: (data:any) => void;
}

const turnoVacio = {
  turno_id:     '',
  nombre:       '',
  apertura:     '',
  cierre:       '',
  inhabilitado: false 
}

export default function NewEditGasto({ open, onOpenChange, mode, turno, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<Turno>(turnoVacio);

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(turnoVacio);
    }
  }, [open, mode]);

  useEffect(() => {
    if (turno && mode === 'edit') {
      setData({
        turno_id:     turno.turno_id,
        nombre:       turno.nombre,
        apertura:     turno.apertura,
        cierre:       turno.cierre,
        inhabilitado: turno.inhabilitado,
      });
    } else {
      setData(turnoVacio);
    }
  }, [turno, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(!data.apertura || data.apertura.length < 5){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un horario de apertura válido');
      setActivo(true);
      return 
    }
    if(!data.cierre || data.cierre.length < 5){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un horario de cierre válido');
      setActivo(true);
      return 
    }
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} turno</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un turno' : 
                                  `Editando turno: ${turno?.turno_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          { mode !== 'create' ? 
            (
              <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={data.turno_id}
                  onChange={(e) => setData({ ...data, turno_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder="Ingresar nombre"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4">
            <label htmlFor="apertura" className='mr-2'>Hora apertura</label>
            <Input
              type="time"
              value={data.apertura}
              onChange={(e) => setData('apertura',e.target.value)}
              step="1"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4">
            <label htmlFor="cierre" className='mr-2'>Hora cierre</label>
            <Input
              type="time"
              value={data.cierre}
              onChange={(e) => setData('cierre',e.target.value)}
              step="1"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val) => setData('inhabilitado', val)} />
          </div>
            
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            type="button" 
          >
            { processing ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
                        ( mode === 'create' ? 'Grabar' : 'Actualizar')  
            }          
          </Button>
        </DialogFooter>
      </DialogContent>
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color="warning"
        onClose={() => setActivo(false)}
      />
    </Dialog>
  );
}
