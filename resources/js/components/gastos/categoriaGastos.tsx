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
import { Loader2, Save, Plus, X, Ban, Pen, Check } from 'lucide-react';
import ShowMessage from "@/components/utils/showMessage";
import { Autocomplete, CategoriaGasto, Gasto } from "@/types/typeCrud";
import { apiRequest, convertirFechaGuionesBarras } from "@/utils";
import { DatePicker } from "../utils/date-picker";
import GenericSelect from "../utils/genericSelect";
import { NumericFormat } from "react-number-format";
import ModalConfirmar from "../modalConfirmar";
import { route } from "ziggy-js";
import { Badge } from "../ui/badge";
import { router } from "@inertiajs/react";

interface Props{
  open: boolean;
  onOpenChange: (open:boolean) => void;
}

const categoriaGastoVacio = {
  categoria_gasto_id: '',
  nombre:             '',
  inhabilitado:       0,
  load:               false,
  editar:             false
};

export default function CategoriaGastos({ open, onOpenChange }: Props){
  //data
  const [activo, setActivo] = useState(false);
  const [text, setText]     = useState('');
  const [title, setTitle]   = useState('');
  const [color, setColor]   = useState('');

  const [confirmar, setConfirmar]           = useState(false);
  const [textoConfirmar, setTextoConfirmar] = useState('');
  const [inhabilitarConfirmar, setInhabilitarConfirmar] = useState(false);
  const [habilitarConfirmar, setHabilitarConfirmar]     = useState(false);
  const [editarConfirmar, setEditarConfirmar]           = useState(false);

  const [load, setLoad]         = useState(false);
  const [nva, setNva]           = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [editando, setEditando] = useState(false);

  const [indiceCategoria, setIndice] = useState<number>(0);

  const { data, setData, get, post, processing, errors } = useForm<CategoriaGasto>(categoriaGastoVacio);
  const [array, setArray]   = useState<CategoriaGasto[]>([]);

  //useEffect
  useEffect(() => {
    if (!open) {
      setData(categoriaGastoVacio);
      setLoad(false);
      setNva(false);
      setArray([]);
    }else{
      const fetchCategorias = async () => {
        try {
          setBuscando(true);
          const res: { categorias: CategoriaGasto[] } = await apiRequest(
            route('categoriaGasto.index'),
            'GET'
          );
          setArray([...res.categorias]);
        } catch (error) {
          console.error("Error al cargar categorías:", error);
        } finally {
          setBuscando(false);
        }
      };

      fetchCategorias();
    }
  }, [open]);

  //funciones
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //preguntar para confimar
    if(!data.nombre){
      setTitle('Campo faltante');
      setText('Debes introducir un nombre para grabar.');
      setColor('warning');
      setActivo(true);
      return;
    }

    setTextoConfirmar('Estás segurp de grabar está categoría de gasto?');
    setConfirmar(true);
  }

  const grabarCategoria = async () => {
    //reseteo
    setTextoConfirmar('');
    setConfirmar(false);
    
    //si confirma...
    setLoading(true);
    setLoad(true);
    let resp : {resultado: number, categoria_gasto_id: number, mensaje?:string} ;
    resp = await apiRequest(
      route('categoriaGasto.store'),
      'POST',
      { ...data }
    );
    setLoad(false);

    if(resp && resp?.resultado == 0){
      setTitle('Error al grabar');
      setText(resp.mensaje??'Ocurrió un error en el registro de la categoria de gastos');
      setColor('error');
      setActivo(true);
      return;
    }

    setTitle('Categoría de gasto creada');
    setText('Se creó correctamente la nueva categoría de gasto');
    setColor('success');
    setActivo(true);

    //ejecutar el buscar
    setBuscando(true);
    let res : { categorias: CategoriaGasto[] } ;
    res = await apiRequest(
      route('categoriaGasto.index'),
      'GET'
    );
    setBuscando(false);
    setArray([...res.categorias]);

    //reseteo y termino
    setNva(false);
    setData({...data, nombre: ''});

    setLoading(false);
  };

  const cancelarGrabar = () => {
    setTextoConfirmar('');
    setConfirmar(false);
  };

  const confirmarInhabilitar = (indice:number) => {
    setIndice(indice);
    setTextoConfirmar('Estás seguro de inhabilitar esta categoría?');
    setInhabilitarConfirmar(true);
  };
  const confirmarHabilitar = (indice:number) => {
    setIndice(indice);
    setTextoConfirmar('Estás seguro de habilitar esta categoría?');
    setHabilitarConfirmar(true);
  };

  const cancelar = () => {
    setTextoConfirmar('');
    setInhabilitarConfirmar(false);
    setHabilitarConfirmar(false);
    setEditarConfirmar(false);
  };

  const inhabilitar = async () =>{
    setTextoConfirmar('');
    setInhabilitarConfirmar(false);
    const id = array[indiceCategoria].categoria_gasto_id;

    setLoading(true);
    array[indiceCategoria].load = true;
    let res : { resultado: number, mensaje:string, categoria_gasto_id: number} ;
    res = await apiRequest(
      route('categoriaGasto.toggleEstado',{ categoria: id }),
      'PUT',
    );
    array[indiceCategoria].load = false;
    
    if(res.resultado === 0){
      setTitle('Error al modificar estado');
      setText(res.mensaje);
      setColor('error');
      setActivo(true);
      return;
    }
    array[indiceCategoria].inhabilitado = 1;

    setTitle('Estado modificado');
    setText(res.mensaje);
    setColor('success');
    setActivo(true);

    setLoading(false);
  };

  const habilitar = async () => {
    setTextoConfirmar('');
    setHabilitarConfirmar(false);
    const id = array[indiceCategoria].categoria_gasto_id;

    setLoading(true);
    array[indiceCategoria].load = true;
    let res : { resultado: number, mensaje:string, categoria_gasto_id: number} ;
    res = await apiRequest(
      route('categoriaGasto.toggleEstado',{ categoria: id }),
      'PUT'
    );
    array[indiceCategoria].load = false;

    if(res.resultado === 0){
      setTitle('Error al modificar estado');
      setText(res.mensaje);
      setColor('error');
      setActivo(true);
      return;
    }
    array[indiceCategoria].inhabilitado = 0;

    setTitle('Estado modificado');
    setText(res.mensaje);
    setColor('success');
    setActivo(true);

    setLoading(false);
  };

  const confirmarEditar = (indice:number) => {
    setIndice(indice);
    if(!array[indiceCategoria].nombre){
      setTitle('Campo faltante');
      setText('Debes introducir un nombre para grabar.');
      setColor('warning');
      setActivo(true);
      return;
    }
    //preguntar
    setTextoConfirmar('Estás seguro de guardar los cambios sobre la categoría?');
    setEditarConfirmar(true);
  };

  const editar = async () => {
    setTextoConfirmar('');
    setEditarConfirmar(false);

    const id = array[indiceCategoria].categoria_gasto_id;
    const payload = { ...array[indiceCategoria] }

    setLoading(true);
    array[indiceCategoria].load = true;
    let res : { resultado: number, mensaje:string, categoria_gasto_id: number} ;
    res = await apiRequest(
      route('categoriaGasto.update',{ categoria: id }),
      'PUT',
      payload
    );
    array[indiceCategoria].load = false;

    if(res.resultado === 0){
      setTitle('Error al modificar datos');
      setText(res.mensaje);
      setColor('error');
      setActivo(true);
      return;
    }
    array[indiceCategoria].nombre = payload.nombre;
    array[indiceCategoria].editar = false;

    setTitle('Categoría modificada');
    setText(res.mensaje);
    setColor('success');
    setActivo(true);

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-h-[95vh] overflow-y-auto !max-w-[60vw] !w-[60vw]`}
        onInteractOutside={(e) => e.preventDefault()}   // bloquea cierre al click afuera
        onEscapeKeyDown={(e) => e.preventDefault()}     // opcional: bloquea cierre con Escape
      >
        <DialogHeader>
          <DialogTitle>Categorías de gastos</DialogTitle>
          <DialogDescription>
            Filtra, crea y edita tus categorías
          </DialogDescription>
          <hr />
        </DialogHeader>
        <form className="grid grid-cols-12 gap-4 px-4 pt-1 pb-4">
          <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12">
            {!nva && (
                <div className="col-span-12 flex justify-end">
                  <Button type="button" title="Crear categoría" onClick={() => setNva(true)}>
                    <Plus /> Nueva
                  </Button>
                </div>
              )}
            {nva && (
              <>
                <div  className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6">
                    <label htmlFor="nombre">Nombre</label>
                    <Input
                      value={data.nombre}
                      onChange={(e) => setData({ ...data, nombre: e.target.value })}
                      placeholder="Asigna un nombre"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 flex justify-end items-center">
                    <Button disabled={load} type="button" variant="outline" className="mr-2" onClick={() => setNva(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={load} type="button" title="Crear categoría" onClick={handleSubmit}>
                      {load? (<Loader2 size={20} className="animate-spin"/>) : (<Save />) } 
                      Grabar
                    </Button>
                  </div>
                </div>
                <hr />
              </>
            )}
          </div>
          <div className="col-span-12 max-h-64 overflow-y-auto mt-">
            <label htmlFor="categorias">Listado de categorías</label>
            <table className="min-w-full border-collapse mt-2 border border-gray-300 rounded">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-1 border">ID</th>
                  <th className="px-2 py-1 border">Nombre</th>
                  <th className="px-2 py-1 border">Estado</th>
                  <th className="px-2 py-1 border">Acción</th>
                </tr>
              </thead>
              <tbody>
                {buscando? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center border rounded">
                      <p>Cargando...</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {array.length > 0 ? (
                      array.map((p, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 border text-right">{p.categoria_gasto_id}</td>
                          <td className="px-2 py-1 border">
                            <>
                              {!p.editar ? 
                                (<p>{p.nombre}</p>)
                                :
                                (<Input
                                  value={p.nombre}
                                  onChange={(e) => {
                                    setArray(prev => {
                                      const nuevo = [...prev];
                                      nuevo[i] = { ...nuevo[i], nombre: e.target.value };
                                      return nuevo;
                                    });
                                  }}
                                  placeholder="Ingresar un nombre"
                                />)
                              }
                            </>
                          </td>
                          <td className="px-2 py-1 border flex justify-center">
                            <Badge
                              variant="secondary"
                              className={`flex items-center justify-center gap-1 ${
                                p.inhabilitado === 0
                                  ? 'bg-green-500 text-white dark:bg-green-600'
                                  : 'bg-red-500 text-white dark:bg-red-600'
                              }`}
                            >
                              {p.inhabilitado === 0 ? 'Habilitado' : 'Inhabilitado'}
                            </Badge>
                          </td>
                          <td className="px-2 py-1 border text-center">
                            {p.inhabilitado === 0? (
                                <>
                                  {p.editar? 
                                    (
                                      <>
                                        <button
                                        disabled={p.load}
                                        type="button"
                                        title="Guardar"
                                        onClick={() => confirmarEditar(i)}
                                        className="text-green-400 hover:text-green-600 mr-2"
                                      >
                                        {!p.load? (<Check size={18} />) : (<Loader2 size={20} className="animate-spin"/>)}
                                      </button>
                                        <button
                                          disabled={p.load}
                                          type="button"
                                          title="Cancelar"
                                          onClick={() => {
                                            setArray(prev => {
                                              const nuevo = [...prev];
                                              nuevo[i] = { ...nuevo[i], editar: false, nombre: nuevo[i].nombreOriginal??'' };
                                              return nuevo;
                                            });
                                          }}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <X size={18} />
                                        </button>
                                      </>
                                    ):
                                    (
                                      <>
                                        <button
                                          disabled={p.load}
                                          type="button"
                                          title="Editar"
                                          onClick={() => {
                                            setArray(prev => {
                                              const nuevo = [...prev];
                                              nuevo[i] = { ...nuevo[i], editar: true, nombreOriginal: nuevo[i].nombre };
                                              return nuevo;
                                            });
                                          }}
                                          className="text-orange-400 hover:text-orange-600 mr-2"
                                        >
                                          <Pen size={18} />
                                        </button>
                                        <button
                                          disabled={p.load}
                                          type="button"
                                          title="Inhabilitar"
                                          onClick={() => confirmarInhabilitar(i)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          {!p.load? (<Ban size={18} />) : (<Loader2 size={20} className="animate-spin"/>)}
                                        </button>
                                      </>
                                    )
                                  }
                                </>
                              ) : (
                                <button
                                  disabled={p.load}
                                  type="button"
                                  title="Habilitar"
                                  onClick={() => confirmarHabilitar(i)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  {!p.load? (<Check size={18} />) : (<Loader2 size={20} className="animate-spin"/>)}
                                </button>
                              )
                            }
                            
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center border rounded">
                          <p>No hay categorías de gastos registradas</p>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={loading} type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => setActivo(false)}
      />
      <ModalConfirmar
        open={confirmar}
        text={textoConfirmar}
        onSubmit={grabarCategoria}
        onCancel={cancelarGrabar}
      />
      <ModalConfirmar
        open={inhabilitarConfirmar}
        text={textoConfirmar}
        onSubmit={inhabilitar}
        onCancel={cancelar}
      />
      <ModalConfirmar
        open={habilitarConfirmar}
        text={textoConfirmar}
        onSubmit={habilitar}
        onCancel={cancelar}
      />
      <ModalConfirmar
        open={editarConfirmar}
        text={textoConfirmar}
        onSubmit={editar}
        onCancel={cancelar}
      />
    </Dialog>
  );
}
