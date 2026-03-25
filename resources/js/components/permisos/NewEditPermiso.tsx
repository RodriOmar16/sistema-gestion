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
import { Autocomplete, Multiple, Permiso } from "@/types/typeCrud";
import { convertirFechaGuionesBarras, ordenarPorTexto } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";
import SelectMultiple from "../utils/select-multiple";

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

  const [roles, setRoles] = useState<Multiple[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Multiple[]>([]);
  const [users, setUsers] = useState<Multiple[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Multiple[]>([]);

  //useEffect
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [ resRoles, resUsers ] = await Promise.all([
          fetch(route('roles.habilitados')),
          fetch(route('users.habilitados')),
        ]);

        const rols = await resRoles.json();
        const user = await resUsers.json();
        setRoles(ordenarPorTexto(rols, 'nombre'));
        setUsers(ordenarPorTexto(user, 'nombre'));
      } catch (error) {
        console.error("Error al cargar los datos: ", error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!open) {
      setData(permisoVacio);
      setSelectedRoles([]);
      setSelectedUsers([]);
    }else{
      if(permiso && mode === 'edit'){
        //guardo la info
        setData({
          permiso_id:   permiso.permiso_id,
          clave:        permiso.clave,
          descripcion:  permiso.descripcion,
          inhabilitado: permiso.inhabilitado
        });

        //pido los datos
        fetch(`/permiso/${permiso.permiso_id}/roles_users`)
          .then(res => res.json())
          .then(({ roles_asignados, usuarios_asignados }) => {
            //console.log("menus_asignados: ",menus_asignados, ".. rutas_asignadas ", rutas_asignadas);
            //console.log("Array.isArray(menus_asignados): ", Array.isArray(menus_asignados))
            setSelectedRoles(ordenarPorTexto(roles_asignados, 'nombre'));
            setSelectedUsers(ordenarPorTexto(usuarios_asignados, 'nombre'));

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

    if(selectedRoles.length === 0 && selectedUsers.length === 0){
      setTitle('Asignación interrumpida');
      setText('Se requiere que asignes este permiso a al menos un usuario o un rol.');
      setActivo(true);
      return 
    }
    onSubmit({
      ...data,
      roles: selectedRoles,
      users: selectedUsers,
    });
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
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="roles">Roles</label>
            <SelectMultiple opciones={roles} seleccionados={selectedRoles} setSeleccionados={setSelectedRoles}/>
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="usuarios">Usuarios</label>
            <SelectMultiple opciones={users} seleccionados={selectedUsers} setSeleccionados={setSelectedUsers}/>
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
