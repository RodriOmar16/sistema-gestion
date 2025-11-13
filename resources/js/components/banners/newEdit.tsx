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

export default function NewEditBanner({ open, onOpenChange, mode, banner, onSubmit }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const { data, setData, get, processing, errors } = useForm<Banner>(bannerVacio);

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(bannerVacio);
    }
  }, [open, mode]);

  useEffect(() => {
    if (banner && mode === 'edit') {
      setData({
        id:    				banner.id,
        url:   				banner.url,
        title: 				banner.title,
        description:  banner.description,
        priority:     banner.priority,
        inhabilitado: banner.inhabilitado,
      });      
    } else {
      setData(bannerVacio);
    }
  }, [banner, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.url){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una url');
      setActivo(true);
      return 
    }
    if(!data.title){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un título');
      setActivo(true);
      return 
    }
    if(!data.priority){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses la prioridad');
      setActivo(true);
      return 
    }
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
              onChange={(e) => setData({ ...data, url: e.target.value })}
              placeholder="Ingresar url"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="title">Título</label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Ingresar título"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="priority">Prioridad</label>
            <Input
              type="number"
              min={0}
              value={data.priority}
              onChange={(e) => setData({ ...data, priority: Number(e.target.value) })}
              placeholder="Ingresar prioridad"
            />
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
