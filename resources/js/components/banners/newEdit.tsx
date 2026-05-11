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
import { Banner } from "@/types/typeCrud";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  banner?: Banner;
  onSubmit: (data:any) => void;
}

const bannerVacio = {
  id:    				'',
  url:   				'',
  title: 				'',
  description:  '',
  priority:     '',
  inhabilitado: false,
}
const erroresVacio = {
  id:    				false,
  url:   				false,
  title: 				false,
  description:  false,
  priority:     false,
};

export default function NewEditBanner({ open, onOpenChange, mode, banner, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<Banner>(bannerVacio);
  const [errores, setErrores] = useState<{
    id:    				boolean,
    url:   				boolean,
    title: 				boolean,
    description:  boolean,
    priority:     boolean,
  }>(erroresVacio);

  //useEffect
  useEffect(() => {
    if (mode === 'create' && !open) {
      setData(bannerVacio);
    } else if (mode === 'edit' && banner) {
      // si está en modo editar y hay banner 
      setData({
        id:           banner.id,
        url:          banner.url,
        title:        banner.title,
        description:  banner.description,
        priority:     banner.priority,
        inhabilitado: banner.inhabilitado,
      });
    } else {
      // cualquier otro caso
      setData(bannerVacio);
    }
  }, [open, mode, banner]);

  useEffect(() => {
    if (!open) {
      setErrores(erroresVacio);
    }
  }, [open]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevosErrores = {
      url:      !data.url,
      title:    !data.title,
      priority: !data.priority,
      id:       false,
      description: false,
    };

    setErrores(nuevosErrores);

    // Si todos los valores de errores son false, no hay errores
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      console.log("faltan campos");
      return;
    }

    console.log("sigue");
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} banner</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un banner' : 
                                  `Editando banner: ${banner?.id}` }
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
                  value={data.id}
                  onChange={(e) => setData({ ...data, id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="url">Url</label>
            <Input
              value={data.url}
              onChange={(e) => {
                setData({ ...data, url: e.target.value })
                if(e.target.value){ errores.url = false; }
              }}
              placeholder="Ingresar url"
            />
            {errores.url && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="title">Título</label>
            <Input
              value={data.title}
              placeholder="Ingresar título"
              onChange={(e) => {
                setData({ ...data, title: e.target.value });
                if(e.target.value){ errores.title = false; }
              }}
            />
            {errores.title && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="priority">Prioridad</label>
            <Input
              type="number"
              min={0}
              value={data.priority}
              onChange={(e) => {
                setData({ ...data, priority: Number(e.target.value) });
                if(e.target.value){ errores.priority = false; }
              }}
              placeholder="Ingresar prioridad"
            />
            {errores.priority && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="description">Descripción</label>
            <Input
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Ingresar descripción"
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
