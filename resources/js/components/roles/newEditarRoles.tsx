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
import { Rol } from "@/types/typeCrud";
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
  rol?: Rol;
  onSubmit: (data:any) => void;
  loading: boolean;
}

const rolVacio = {
  rol_id: '',
  nombre: '',
  inhabilitado: false,
}

export default function NewEditRol({ open, onOpenChange, mode, rol, onSubmit, loading }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');

  const { data, setData, get, processing, errors } = useForm<{
    rol_id: string | number;
    nombre: string;
    inhabilitado: 1 | 0 | boolean;
  }>(rolVacio);

  const [menus, setMenu] = useState<Multiple[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Multiple[]>([]);
  const [rutas, setRutas] = useState<Multiple[]>([]);
  const [selectedRutas, setSelectedRutas] = useState<Multiple[]>([]);

  //useEffect
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/menu_habilitados')
    .then(res => res.json())
    .then(data => {
      const opcionesOrdenadas = ordenarPorTexto(data, 'nombre');
      setMenu(opcionesOrdenadas);
    });
  }, []);
  useEffect(() => {
    //optengo los datos del formulario
    fetch('/rutas_habilitadas')
    .then(res => res.json())
    .then(data => {
      const opcionesOrdenadas = ordenarPorTexto(data, 'nombre');
      setRutas(opcionesOrdenadas);
    });
  }, []);
  useEffect(() => {
    if (!open && mode === 'create') {
      setData(rolVacio);
      setSelectedMenus([{id: 1, nombre: 'Dashboard'}]);
      setSelectedRutas([{id: 1, nombre: '/dashboard'}]);
    }
  }, [open, mode]);

  useEffect(() => {
    if (rol && mode === 'edit') {
      setData({
        rol_id: rol.rol_id,
        nombre: rol.nombre,
        inhabilitado: Boolean(rol.inhabilitado),
      });

      // Consulta de menús y rutas asignados al rol
      fetch(`/rol/${rol.rol_id}/menus_rutas`)
        .then(res => res.json())
        .then(({ menus_asignados, rutas_asignadas }) => {
          console.log("menus_asignados, rutas_asignadas: ", menus_asignados, rutas_asignadas)
          if(menus_asignados && menus_asignados.length == 0){
            // Asegurarse que vengan en formato Multiple[]
            setSelectedMenus([{id: 1, nombre: 'Dashboard'}]);
          }else{
            const menusOrdenados = ordenarPorTexto(menus_asignados, 'nombre');
            setSelectedMenus(menusOrdenados);
          }
          if(rutas_asignadas && rutas_asignadas.length == 0){
            setSelectedRutas([{id: 1, nombre: '/dashboard'}]);
          }else{
            const rutasOrdenadas = ordenarPorTexto(rutas_asignadas, 'nombre');
            setSelectedRutas(rutasOrdenadas);
          }
        });
    } else {
      setData(rolVacio);
      setSelectedMenus([{id: 1, nombre: 'Dashboard'}]);
      setSelectedRutas([{id: 1, nombre: '/dashboard'}]);
    }
  }, [rol, mode]);


  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!data.nombre){
      setTitle('¡Campo faltante!');
      setText('Se requiere que ingreses un nombre válido');
      setActivo(true);
      return 
    }
    if(selectedMenus.length == 0){
      setTitle('Falta Seleccionar');
      setText('Se requiere que seleccione al menos una opción de menu');
      setActivo(true);
      return 
    }
    if(selectedRutas.length == 0){
      setTitle('Falta Seleccionar');
      setText('Se requiere que seleccione al menos una ruta');
      setActivo(true);
      return 
    }
    onSubmit({
      ...data,
      menus: selectedMenus,
      rutas: selectedRutas
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}</DialogTitle>
          <DialogDescription>
            { mode === 'create' ? 'Completa los campos para crear un rol' : 
                                  `Editando rol: ${rol?.rol_id}` }
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
                  value={data.rol_id}
                  onChange={(e) => setData({ ...data, rol_id: e.target.value })}
                  placeholder="Id"
                />
              </div>
            ) : <></>
          }
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6">
            <label htmlFor="nombre">Nombre</label>
            <Input
              value={data.nombre}
              onChange={(e) => setData({ ...data, nombre: e.target.value })}
              placeholder="Nombre"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex flex-col">
            <label htmlFor="inhabilitado" className='mr-2'>Inhabilitado</label>
            <Switch checked={data.inhabilitado?true:false} onCheckedChange={(val) => setData('inhabilitado', val)} />
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="menus">Menús</label>
            <SelectMultiple opciones={menus} seleccionados={selectedMenus} setSeleccionados={setSelectedMenus}/>
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            <label htmlFor="menus">Rutas</label>
            <SelectMultiple opciones={rutas} seleccionados={selectedRutas} setSeleccionados={setSelectedRutas}/>
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
