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
import { User } from "@/types/typeCrud";
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ShowMessage from "@/components/utils/showMessage"
import SelectMultiple from "../utils/select-multiple";
import { Multiple } from "@/types/typeCrud";
import { ordenarPorTexto } from "@/utils";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
  mode: 'create' | 'edit';
  user?: User;
  onSubmit: (data:any) => void;
  loading: boolean;
}

const userVacio = {
  id: '',
  name: '',
  email: '',
  inhabilitado: false,
}

export default function NewEditUser({ open, onOpenChange, mode, user, onSubmit, loading }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<User>(userVacio);

  const [roles, setRoles] = useState<Multiple[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Multiple[]>([]);

  //useEffect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/roles_habilitados')
    .then(res => res.json())
    .then(data => {
      setRoles(ordenarPorTexto(data, 'nombre'));
    });
  }, []);
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(userVacio);
      setSelectedRoles([]);
    }
  }, [open, mode]);

  useEffect(() => {
    if (user && mode === 'edit') {
      setData({
        id: user.id,
        name: user.name,
        email: user.email,
        inhabilitado: user.inhabilitado,
      });

      // Consulta de menús y rutas asignados al rol
      fetch(`/user/${user.id}/roles_user`)
        .then(res => res.json())
        .then(({ roles_asignados }) => {
          console.log("roles_asignados: ", roles_asignados)
          if(roles_asignados && roles_asignados.length == 0){
            // Asegurarse que vengan en formato Multiple[]
            setSelectedRoles([]);
          }else{
            setSelectedRoles(ordenarPorTexto(roles_asignados, 'nombre'));
          }
        });
    } else {
      setData(userVacio);
      setSelectedRoles([]);
    }
  }, [user, mode]);


  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.name){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(selectedRoles.length == 0){
      setTitle('Falta Seleccionar');
      setText('Se requiere que seleccione al menos un rol');
      setActivo(true);
      return 
    }
    onSubmit({
      ...data,
      roles: selectedRoles,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un usuario' : 
                                  `Editando usuario: ${user?.id}` }
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
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Ingresar nombre"
            />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="email">Email</label>
            <Input
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="Ingresar email"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val) => setData('inhabilitado', val)} />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="roles">Roles</label>
            <SelectMultiple 
              opciones={roles} 
              seleccionados={selectedRoles} 
              setSeleccionados={setSelectedRoles}
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
