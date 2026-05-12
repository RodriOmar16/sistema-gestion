import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label"
import { useForm } from "@inertiajs/react"
import React, { use, useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"
import SelectMultiple from "../utils/select-multiple";
import { Categoria } from "@/types/typeCrud";
import { ordenarPorTexto } from "@/utils";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  categoria?: Categoria;
  onSubmit: (data:any) => void;
}

const categoriaVacia = {
  categoria_id: '',
  nombre: '',
  inhabilitada: false,
}

export default function NewEditCategoria({ open, onOpenChange, mode, categoria, onSubmit }: Props){
  //data
  const { data, setData, get, processing, errors } = useForm<Categoria>(categoriaVacia);

  const [requerido, setRequerido] = useState(false);

  //useEffect
  useEffect(() => {
    if(mode === 'create' && !open){
      setData(categoriaVacia);
    }else if (categoria && mode === 'edit') {
      setData({
        categoria_id: categoria.categoria_id,
        nombre: categoria.nombre,
        inhabilitada: categoria.inhabilitada,
      });      
    } else {
      setData(categoriaVacia);
    }
  }, [open, categoria, mode]);

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
          <DialogTitle>{mode === 'create' ? 'Nueva' : 'Editar'} categoría</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear una categoría' : 
                                  `Editando categoría: ${categoria?.categoria_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          { mode !== 'create' ? 
            (
              <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={data.categoria_id}
                  onChange={(e) => setData({ ...data, categoria_id: e.target.value })}
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
                if(e.target.value){ setRequerido(false); }
              }}
            />
            {requerido && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitada?true:false} onCheckedChange={(val) => setData('inhabilitada', val)} />
          </div>
        </div>
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
