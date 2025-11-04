import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { use, useState, useEffect } from "react"
import { usePage, useForm, router } from '@inertiajs/react';
import { Menu } from "@/types/typeCrud"
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"

interface Props {
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  menu?: Menu;
  onSubmit: (data:Menu) => void;
  loading: boolean;
  padres: any[];
}

export default function NewEditDialog({ open, onOpenChange, mode, menu, onSubmit, loading, padres }: Props){
  //data
  const menuVacio = {
    menu_id:      null,
    nombre:       '',
    padre_id:     0,
    padre_nombre: '',
    orden:        0,
    icono:        '',
    inhabilitado: false,
  };
  const [ activo, setActivo ] = useState(false);
  const [ text, setText ]     = useState('');
  const [ title, setTitle ]   = useState('');
  const { data, setData, post, put, processing, errors } = useForm<Menu>(menuVacio);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre del menú');
      setActivo(true);
      return 
    }
    if(!data.icono){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses el icono');
      setActivo(true);
      return;
    }
    onSubmit(data);
  }
  
  //useEffect
    useEffect(() => {
    //reinicia el dialog
    if (!open && mode === 'create') {
      setData(menuVacio);
    }
  }, [open, mode]);

  useEffect(() => {
    //rellena los campos
    if(menu){
      setData({
        menu_id:      menu.menu_id,
        nombre:       menu.nombre,
        padre_id:     menu.padre_id??0,
        padre_nombre: menu.padre_nombre,
        orden:        0,
        icono:        menu.icono,
        inhabilitado: menu.inhabilitado,
      });
    }else setData(menuVacio)
  }, [menu]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Menú' : 'Editar Menú'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un nuevo menú' : 
                                  `Editando menú: ${menu?.menu_id}` }
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
                  value={data.menu_id??''}
                  onChange={(e) => setData({ ...data, menu_id: Number(e.target.value) })}
                  placeholder="Id"
                />
              </>
            ) : <></>
          }
          <label htmlFor="nombre">Nombre</label>
          <Input
            value={data.nombre}
            onChange={(e) => setData({ ...data, nombre: e.target.value })}
            placeholder="Nombre"
          />
          <label htmlFor="padre">Selec. Padre</label>
          <Select
            value={String(data.padre_id)}
            onValueChange={(value) => setData('padre_id', Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {padres.map((e: any) => (
                  <SelectItem key={e.menu_id} value={String(e.menu_id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <label htmlFor="icono">Icono</label>
          <Input
            value={data.icono}
            onChange={(e) => setData({ ...data, icono: e.target.value })}
            placeholder="ícono"
          />
          <label className='mr-2'>Inhabilitado</label>
          <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val:any) => setData('inhabilitado', val)} />
          <div>asignarle la ruta</div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            type="button" 
          >
            { loading ? ( <Loader2 size={20} className="animate-spin mr-2"/> ) :
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
