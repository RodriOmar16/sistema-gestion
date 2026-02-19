import AppLayout from '@/layouts/app-layout';
import { Autocomplete, Caja } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Barcode } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table";
import { Select,  SelectContent, SelectGroup,  SelectItem,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras, convertirNumberPlata, ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';
import SubirImagen from '@/components/utils/subir-imagen';
import GenericSelect from '@/components/utils/genericSelect';
import { NumericFormat } from 'react-number-format';

const breadcrumbs: BreadcrumbItem[] = [ { title: '', href: '', } ];
const cajaVacia = {
  caja_id:            0,
  turno_id:           0,
  turno_nombre:       '',
  fecha:              (new Date()).toLocaleDateString(),
  fecha_desde:        '',
  fecha_hasta:        '',
  monto_inicial:      0,
  descripcion:        '',
  efectivo:           0,
  efectivo_user:      0,
  debito:             0,
  debito_user:        0,
  transferencia:      0,
  transferencia_user: 0,
  total_sistema:      0,
  total_user:         0,
  diferencia:         0,
};

type ConcepValor = {concepto: string, valor: number}

export default function CreateViewCajas(){
  //data
  const [ load, setLoad ] = useState(false);
  const { mode, caja, resultado, mensaje, caja_id, timestamp, ingresos, egresos } = usePage().props as { 
    mode?:      string | 'create' | 'edit';
    caja?:      Caja;
    resultado?: number;
    mensaje?:   string;
    caja_id?:   number;
    timestamp?: number;
    ingresos?:  ConcepValor[];
    egresos?:   ConcepValor[];
  };
  breadcrumbs[0].title = (mode=='create'? 'Nueva' : 'Detalles de la')+' caja'+(mode!='create'? ` ${caja?.caja_id}` : '')//(mode=='create'? 'Nuevo' : 'Editar')+' producto';
  const [ultimoTimestamp, setUltimoTimestamp] = useState<number | null>(null);
  const { data, setData, errors, processing } = useForm<Caja>(cajaVacia);

  const [confirmOpen, setConfirOpen] = useState(false); //modal para confirmar acciones para cuado se crea o edita
  const [textConfir, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);
  const [title, setTitle]   = useState('');
  const [text, setText]     = useState('');
  const [color, setColor]   = useState('success');

  const [optionTur, setOptionTurn]      = useState<Autocomplete|null>(null);

  //Effect

  useEffect(() => {
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;
    //const cambioDetectado = (resultado && resultado  !== propsActuales.resultado) || (mensaje && mensaje    !== propsActuales.mensaje) 

    if (cambioDetectado) {
      //setPropsActuales({ resultado, mensaje, producto_id });
      setUltimoTimestamp(timestamp);

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : mode === 'create' ? 'Caja nueva' : 'Caja modificada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${caja_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true); 
    }
  }, [resultado, mensaje, caja_id, timestamp, ultimoTimestamp, mode]);

  /*useEffect(() => {
    if(producto && mode === 'edit'){
      setData({
        producto_id:         producto.producto_id,
        producto_nombre:     producto.producto_nombre,
        descripcion:         producto.descripcion,
        categoria_id:        '',
        categoria_nombre:    '',
        precio:              producto.precio,
        inhabilitado:        producto.inhabilitado,
        imagen:              producto.imagen,
        marca_id:            producto.marca_id,
        marca_nombre:        producto.marca_nombre, 
        codigo_barra:        producto.codigo_barra,
        stock_minimo:        producto.stock_minimo,
        vencimiento:         producto.vencimiento? convertirFechaGuionesBarras(producto.vencimiento) : '',
      });
    }
  }, [mode, producto]);*/

  useEffect(() => {
    if (data.turno_id && data.turno_nombre) {
      setOptionTurn({ value: Number(data.turno_id), label: data.turno_nombre });
    } else {
      setOptionTurn(null);
    }
  }, [data.turno_id, data.turno_nombre]);

  //funciones
  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    /*if(!data.producto_nombre){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un nombre para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.codigo_barra){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un código de barras para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.precio || data.precio === 0){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un precio para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.stock_minimo || data.stock_minimo === 0){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un valor de stock mínimo para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.marca_id){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar una marca para el producto.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(catSelected.length === 0){
      setTitle('Categoría requerida!');
      setText('Se requiere seleccionar al menos una categoría.');
      setColor('warning');
      setActivo(true);
      return 
    }
    setTextConfirm("Estás seguro de "+(mode==='create'?'crear':'actualizar')+' este producto?');
    setConfirOpen(true);*/
  };

  const grabarGuardar = () => {
    /*//reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');

    //muestro el cargando...
    setLoad(true); 
    
    const payload = {
      ...data,
      categorias: catSelected,
      vencimiento: data.vencimiento?convertirFechaBarrasGuiones(data.vencimiento) : '',
      imagen: urlImg && data.imagen !== urlImg ? urlImg: data.imagen
      //file: file,
      //nombre: data.producto_nombre
    };

    if (mode === 'create') {
      router.post(
        route('productos.store'),payload,
        {
          //forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
    } else {
      router.put(
        route('productos.update',{producto: data.producto_id}),
        payload,
        {
          //forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
    }
    setTitle('');
    setText('');
    setActivo(false);*/
  };
  
  const cancelar = () => {
    setConfirOpen(false);
  };

  const selectTurnos = (option : any) => {
    if(option){
      setData({...data, turno_id: option.value, turno_nombre: option.label});
      setOptionTurn(option);
    }else{
      setData({...data, turno_id: 0, turno_nombre: ''});
      setOptionTurn(null);
    }
  };

  const iniciarCaja = () => {
    //llamar al back, creat la caja_id, guardar monto_inicial, turno_id, generar los valores de efectivo, debito 
    //transferencia de ingresos y egresos y devolverlos
    if(!data.turno_id){
      setTitle('Campo requerido!');
      setText('Se requiere seleccionar un turno para empezar.');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(!data.monto_inicial || data.monto_inicial === 0){
      setTitle('Campo requerido!');
      setText('Se requiere ingresar un monto para empezar');
      setColor('warning');
      setActivo(true);
      return 
    }

    //cambiar fecha a fechas con guiones antes de mandar
    data.fecha = convertirFechaBarrasGuiones(data.fecha);
    setLoad(true);
    console.log("abriendo caja")

    //aquí quiero hacer la consulta y llamar a laravel para que me haga los procesos y volver aquí con los valores correctos
    //para seguir el flujo, o debo hacerlos a todos un useState????
    const payload = {...data};
    router.post(route('caja.open'), payload, {
      onError: (errors) => {
        setTitle('Error');
        setText('No se pudo abrir la caja');
        setColor('danger');
        setActivo(true);
      },
      onFinish: () => setLoad(false),
    });
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nueva' : 'Detalles de la')+' caja'} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="pb-3 relative flex-none flex-1  rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <form 
            className='grid grid-cols-12 gap-4 p-4'
            onSubmit={handleSubmit}
          >
            {!caja ? (
              <> 
                <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
                  Turnos
                  <GenericSelect
                    route="turnos"
                    value={optionTur}
                    onChange={(option) => selectTurnos(option)}
                    placeHolder='Seleccionar'
                  />
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                  <label htmlFor="monto">Monto inicial</label>
                  <NumericFormat 
                    value={data.monto_inicial} 
                    thousandSeparator="." 
                    decimalSeparator="," 
                    prefix="$" 
                    className="text-right border rounded px-2 py-1" 
                    onValueChange={(values) => { setData({...data, monto_inicial: values.floatValue || 0}) }}
                    onKeyDown={(e) => { if (e.key === "Enter") { 
                      e.preventDefault(); // 👈 evita el submit 
                      iniciarCaja(); 
                    } }}
                  />	
                </div>
                <div  className='flex items-center  justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-3'>
                  <Button type="button" onClick={iniciarCaja}>
                    { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                              (<Save size={20} className=""/>)  }
                    Abrir caja
                  </Button>
                </div>
              </>
            ): (
              <>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
                  <label htmlFor="id">Id</label>
                  <Input disabled value={data.caja_id} onChange={(e)=>setData({...data, caja_id:e.target.value})}/>	
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
                  <label htmlFor="turno_nombre">Turno</label>
                  <Input disabled value={data.turno_nombre}/>	
                </div>
                <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
                  <label htmlFor="fecha">Fecha</label>
                  <DatePicker disable fecha={(data.fecha)} setFecha={ (fecha:string) => {setData({...data,fecha: fecha})} }/>
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                  <label htmlFor="monto">Monto inicial</label>
                  <NumericFormat 
                    value={data.monto_inicial} 
                    thousandSeparator="." 
                    decimalSeparator="," 
                    prefix="$" 
                    className="text-right border rounded px-2 py-1" 
                    disabled
                    onValueChange={(values) => { setData({...data, monto_inicial: values.floatValue || 0}) }}
                    onKeyDown={(e) => { if (e.key === "Enter") { 
                      e.preventDefault(); // 👈 evita el submit 
                      iniciarCaja(); 
                    } }}
                  />	
                </div>
                <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                  <hr />
                  <div className='py-4 px-4'>
                    Según el sistema
                    <hr />
                  </div>
                  <p className=''>* INGRESOS</p>
                  <div className='grid grid-cols-12 gap-4 '>
                    { (ingresos??[]).map((e:any) => (
                        <>
                          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 text-left' >
                          - {e.concepto}: 
                          </div>
                          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6' >
                            $ {e.valor}
                          </div>
                        </>
                      ))
                    }
                  </div>
                  <p className=''>* EGRESOS</p>
                  <div className='grid grid-cols-12 gap-4 '>
                    { (egresos??[]).map((e:any) => (
                        <>
                          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 text-left' >
                          - {e.concepto}: 
                          </div>
                          <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6' >
                            $ {e.valor}
                          </div>
                        </>
                      ))
                    }
                  </div>
                  <div className='flex justify-center bg-gray'>
                    <p>Total: </p>
                    <p>{convertirNumberPlata(String(data.total_sistema))}</p>
                  </div>
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                  <hr />
                  <div className='py-4 px-4'>
                    Según el usuario
                    <hr />
                  </div>
                  <p className=''>* INGRESOS</p>
                  <div className='grid grid-cols-12 gap-4 '>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 text-left' >
                    - Efectivo: 
                    </div>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6' >
                      <NumericFormat 
                        value={data.efectivo_user} prefix="$" 
                        thousandSeparator="." decimalSeparator="," 
                        className="text-right border rounded px-2 py-1" 
                        onValueChange={(values) => { setData({...data, efectivo_user: values.floatValue || 0}) }}
                      />	
                    </div>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 text-left' >
                    - Débito: 
                    </div>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6' >
                      <NumericFormat 
                        value={data.debito_user} prefix="$" 
                        thousandSeparator="." decimalSeparator="," 
                        className="text-right border rounded px-2 py-1" 
                        onValueChange={(values) => { setData({...data, debito_user: values.floatValue || 0}) }}
                      />
                    </div>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6 text-left' >
                    - Transferencia: 
                    </div>
                    <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6' >
                      <NumericFormat 
                        value={data.transferencia_user} prefix="$" 
                        thousandSeparator="." decimalSeparator="," 
                        className="text-right border rounded px-2 py-1" 
                        onValueChange={(values) => { setData({...data, transferencia_user: values.floatValue || 0}) }}
                      />
                    </div>
                  </div>
                  <div className='flex justify-center bg-gray'>
                    <p>Total: </p>
                    <p>{convertirNumberPlata(String(data.total_user))}</p>
                  </div>
                </div>
                <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                  <div className={`flex justify-center bg-${data.total_sistema - data.total_user > 0 ? 'red' : 'green'}`}>
                    <p>Diferencia: </p>
                    <p>{convertirNumberPlata(String(data.total_sistema - data.total_user))}</p>
                  </div>
                </div>
                <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                  <Button type="button" onClick={handleSubmit}>
                    { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                              (<Save size={20} className=""/>)  }
                    Grabar
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
      <ModalConfirmar
        open={confirmOpen}
        text={textConfir}
        onSubmit={grabarGuardar}
        onCancel={cancelar}
      />
      <ShowMessage 
        open={activo}
        title={title}
        text={text}
        color={color}
        onClose={() => {
            setActivo(false);
            if (resultado === 1 && caja_id){
              router.get(route('caja.edit', { caja: caja_id }));
            }
          }
        }
      />
    </AppLayout>
  );
}