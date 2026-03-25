import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { useForm } from "@inertiajs/react"
import React, { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Autocomplete, Permiso } from "@/types/typeCrud";
import { convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  permiso?: Permiso;
  onSubmit: (data:any) => void;
}

const permisoVacio = {
  permiso_id:   '',
  clave:        '',
  descripcion:  '',
  inhabilitado: 0
};

export default function NewEditPermiso({ open, onOpenChange, mode, permiso, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, post, processing, errors } = useForm<Permiso>(permisoVacio);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(permisoVacio);
    }else{
      if(permiso && mode === 'edit'){
        setData({
          permiso_id:   permiso.permiso_id,
          clave:        permiso.clave,
          descripcion:  permiso.descripcion,
          inhabilitado: permiso.inhabilitado
        });        
      }
    }
  }, [open, mode, permiso]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!data.descripcion){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una descripcion');
      setActivo(true);
      return 
    }
    if(data.clave === ''){
      setTitle('¡Campo faltante!');
      setText('Se requiere que definas una clave');
      setActivo(true);
      return 
    }
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} permiso</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un permiso' : 
                                  `Editando permiso: ${permiso?.permiso_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          { mode !== 'create' ? 
            (
              <>
                <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                  <label htmlFor="id">Id</label>
                  <Input
                    disabled
                    value={data.permiso_id}
                    onChange={(e) => setData({ ...data, permiso_id: e.target.value })}
                    placeholder="Id"
                  />
                </div>
              </>
            ) : <></>
          }
          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
            Clave
            <Input value={data.clave} onChange={(e)=>setData('clave', e.target.value)}/>	
          </div>
          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
            <label htmlFor="descripcion">Descripción</label>
            <Textarea 
              id="descripcion" 
              placeholder="Escribe una detalle..." 
              value={data.descripcion}
              onChange={(e) => setData({...data, descripcion: e.target.value})}
            />
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
