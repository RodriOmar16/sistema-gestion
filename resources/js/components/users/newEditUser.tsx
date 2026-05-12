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
  permiso: boolean;
}

const userVacio = {
  id: '',
  name: '',
  email: '',
  inhabilitado: false,
};

const requeridosReset = {
  name:  false,
  email: false,
  roles: false
};

export default function NewEditUser({ open, onOpenChange, mode, user, onSubmit, permiso }: Props){
  //data
  const { data, setData, get, processing, errors } = useForm<User>(userVacio);

  const [requeridos, setRequeridos] = useState<{
    name:  boolean,
    email: boolean,
    roles: boolean
  }>(requeridosReset); 

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
    if(!open){
      setRequeridos(requeridosReset);
      setData(userVacio);
      setSelectedRoles([]);
    }   
  }, [open]);

  useEffect(() => {
    if(!open && mode === 'create'){
      setData(userVacio);
      setSelectedRoles([]);
    }else if (user && mode === 'edit') {
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
        if(roles_asignados && roles_asignados.length == 0){
          // Asegurarse que vengan en formato Multiple[]
          setSelectedRoles([]);
        }else{
          setSelectedRoles(ordenarPorTexto(roles_asignados, 'nombre'));
        }
      });
    }else{
      setData(userVacio);
      setSelectedRoles([]);
    }
  }, [open, user, mode]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /*if(!data.name){
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
    }*/
    const nuevosErrores = {
      name:  !data.name,
      email: !data.email,
      roles: selectedRoles.length == 0
    };
    setRequeridos(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some(e => e);

    if (hayErrores) {
      return;
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
          <DialogTitle>{mode === 'create' ? 'Nuevo' : 'Editar'} usuario</DialogTitle>
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
              placeholder="Ingresar nombre"
              onChange={(e) => {
                setData({ ...data, name: e.target.value });
                if(e.target.value){ requeridos.name = false; }
              }}
            />
            { requeridos.name && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="email">Email</label>
            <Input
              value={data.email}
              placeholder="Ingresar email"
              onChange={(e) => {
                setData({ ...data, email: e.target.value });
                if(e.target.value){ requeridos.email = false; }
              }}
            />
            { requeridos.email && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
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
            { requeridos.roles && (<p className="mt-1 text-sm text-red-600 font-medium">⚠️Campo requerido</p>)}
          </div>
        </form>
        {permiso && (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
