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
import { Ruta } from "@/types/typeCrud"
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  ruta?: Ruta;
  onSubmit: (data:Ruta) => void;
  loading: boolean;
}

export default function NewEditDialog({ open, onOpenChange, mode, ruta, onSubmit, loading }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<{
    ruta_id: string | number;
    url: string;
    inhabilitada: 1 | 0 | boolean;
  }>({
    ruta_id: '',
    url: '',
    inhabilitada: false,
  });

  //useEffect
  useEffect(() => {
    if (!open && mode === 'create') {
      setData({ ruta_id: '', url: '', inhabilitada: false });
    }
  }, [open, mode]);

  useEffect(() => {
    if(ruta){
      setData({ ruta_id: ruta.ruta_id, url: ruta.url, inhabilitada: ruta.inhabilitada })
    }else setData({ ruta_id: '', url: '', inhabilitada: false });
  }, [ruta]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.url){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una url válida');
      setActivo(true);
      return 
    }
    if(!data.url.includes('/')){
      data.url = '/'+data.url.trim();
    }
    data.url = data.url.replaceAll(' ','-');
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear una ruta' : 
                                  `Editando ruta: ${ruta?.ruta_id}` }
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="space-y-4">
          { mode !== 'create' ? 
            (
              <>
                <label htmlFor="id">Id</label>
                <Input
                  disabled
                  value={data.ruta_id}
                  onChange={(e) => setData({ ...data, ruta_id: e.target.value })}
                  placeholder="Id"
                />
              </>
            ) : <></>
          }
          <label htmlFor="nombre">Url</label>
          <Input
            value={data.url}
            onChange={(e) => setData({ ...data, url: e.target.value })}
            placeholder="No se requiere ingresar '/'"
          />
          <label className='mr-2'>Inhabilitada</label>
          <Switch checked={data.inhabilitada?true:false} onCheckedChange={(val) => setData('inhabilitada', val)} />
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
