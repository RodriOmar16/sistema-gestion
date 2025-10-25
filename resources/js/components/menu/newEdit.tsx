import { Button } from "@/components/ui/button"
import {
  Dialog,  DialogClose,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,
  DialogTitle,  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { use, useState, useEffect } from "react"
import { usePage, useForm, router } from '@inertiajs/react';
import { Menu } from "@/types/menus"
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
}

export default function NewEditDialog({ open, onOpenChange, mode, menu, onSubmit, loading }: Props){
  const menuVacio = {
    menu_id:      null,
    nombre:       '',
    padre:        0,
    orden:        0,
    icono:        '',
    inhabilitado: false,
  };
  const [ activo, setActivo ] = useState(false);
  const [ text, setText ]     = useState('');
  const [ title, setTitle ]   = useState('');
  const { data, setData, post, put, processing, errors } = useForm<Menu>(menuVacio);

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
        padre_id:        menu.padre_id,
        padre_nombre: menu.padre_nombre,
        orden:        0,
        icono:        '',
        inhabilitado: false,
      });
    }else setData(menuVacio)
  }, [menu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre al proyecto');
      setActivo(true);
      return 
    }
    if(!form.descripcion){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses una descripción al proyecto');
      setActivo(true);
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un nuevo proyecto' : 
                                  `Editando proyecto: ${project?.id}` }
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
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="Id"
                />
              </>
            ) : <></>
          }
          <label htmlFor="nombre">Nombre</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
          />
          <label htmlFor="">Descripción</label>
          <Textarea 
            value={form.descripcion} 
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Describa el proyecto aquí..." />
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
