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
import { Marca } from "@/types/typeCrud";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  marca?: Marca;
  onSubmit: (data:any) => void;
}

const marcaVacia = {
  marca_id:     '',
  nombre:       '',
  inhabilitada: false 
}

export default function NewEditMarca({ open, onOpenChange, mode, marca, onSubmit }: Props){
  //data
  const { data, setData, get, processing, errors } = useForm<Marca>(marcaVacia);
  const [requerido, setRequerido] = useState(false);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(marcaVacia);
      return;
    }

    if (marca) {
      setData({
        marca_id:     marca.marca_id,
        nombre:       marca.nombre,
        inhabilitada: marca.inhabilitada,
      });
    } else {
      setData(marcaVacia);
    }
  }, [open, marca]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setRequerido(true);
      return 
    }
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nueva' : 'Editar'} marca</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear una marca' : 
                                  `Editando marca: ${marca?.marca_id}` }
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
                  value={data.marca_id}
                  onChange={(e) => setData({ ...data, marca_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              placeholder="Ingresar nombre"
              onChange={(e) => {
                setData({ ...data, nombre: e.target.value });
                if(e.target.value){setRequerido(false);}
              }}
            />
            {requerido && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex flex-col">
            <label htmlFor="inhabilitada" className='mr-2'>Inhabilitada</label>
            <Switch checked={data.inhabilitada?true:false} onCheckedChange={(val) => setData('inhabilitada', val)} />
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
    </Dialog>
  );
}
