import AppLayout from '@/layouts/app-layout';
import { Venta, Cliente, AuthProps } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus, Search, Ban, AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple, Autocomplete } from '@/types/typeCrud';
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras, convertirNumberPlata, ordenarPorTexto, redondear } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';
import TableDetalles from '@/components/ventas/tableDetalles';
import InputDni from '@/components/utils/input-dni';
import TableFormasPago from '@/components/ventas/tableFormasPago';
import GenericSelect from '@/components/utils/genericSelect';
import { NumericFormat } from 'react-number-format';

const breadcrumbs: BreadcrumbItem[] = [ { title: '', href: '', } ];
const ventaVacia = {
  venta_id:        '',
  fecha_grabacion: (new Date()).toLocaleDateString(),
  fecha_desde:     '',
  fecha_hasta:     '',
  cliente_id:      '',
  cliente_nombre:  '',
  fecha_anulacion: '',
  total:           0,
  anulada:         false,
};
const clienteVacio = {
  cliente_id:       '',
  nombre:           '',
  fecha_nacimiento: '',
  domicilio:        '',
  email:            '',
  dni:              '',
  inhabilitado:     false,
}
const formaPagoVacia = {
  id: 0, 
  nombre: '', 
  monto: 0, 
  fecha: (new Date()).toLocaleDateString()
}
type Detalle  = {id: number, nombre:string, precio:number , cantidad: number };
type FormPago = {id: number, nombre: string, monto: number, fecha: string};

//-----------------------------------------------------------------------------------
/*type ProductoHab = {
  id: number; 
  nombre: string, 
  precio: number, 
};*/
interface PropsDet{
  data: Venta;
  set: (e:any) => void;
  modo: string;
  productos: Detalle[];
  setProd: (e:any) => void;
  setTitle: (p:string) => void;
  setText: (p:string) => void;
  setColor: (p:string) => void;
  setActivo: (p:boolean) => void;
};
export function DetallesVenta({modo, data, set, productos, setProd, setTitle, setText, setColor, setActivo }:PropsDet){
  const [totalAux, setTotalAux]           = useState(0); 
  const [productoId, setProdId]           = useState(0);
  const [optionProduct, setOptionProduct] = useState<Autocomplete|null>(null);
  const [load, setLoad]                   = useState(false);
  
  const controlarTotal = (e:number) => {
    setTotalAux(e);
    set({...data, total:Number(e)})
  };

  const agregarProducto = async () => {
    if(productoId===0){ //si no seleccionas nada 
      return;
    }
    setLoad(true);
    const res  = await fetch(route('productos.getProducto', productoId));
    const data = await res.json();
    setLoad(false);
    
    if(data.resultado == 0){
      setTitle("Problemas al agregar");
      setText(data?.mensaje);
      setColor("error");
      setActivo(true);
      return 
    }

    const producto = data.producto;    

    //si ya existe al menos 1
    const obj = productos.find(e => e.id === productoId)
    if(obj){
      //si está agregado le sumo la cantidad
      setProd((prev:any) =>
        prev.map((d:any) =>
          d.id === productoId ? { ...d, cantidad: d.cantidad + 1 } : d
        )
      );
    } else {
      //si no está, lo agrego con cantidad 1
      //const producto = productosHab.find(e => e.id === productoId);
      if (producto) {
        setProd((prev:any) => [
          ...prev,
          {
            id: producto.producto_id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: 1,
          },
        ]);
      }
    }

    setProdId(0);
    setOptionProduct(null);
  };

  const quitarProducto = (id:number) => {
    const aux = productos.filter(e => e.id !== id);
    setProd(aux);
  };

  const seleccionarProducto = (option : any) => {
    if(option){
      //set({...data, producto_id: option.value, producto_nombre: option.label});
      setProdId(option.value);
      setOptionProduct(option);
    }else{
      //set({...data, producto_id: '', producto_nombre: ''});
      setProdId(0);
      setOptionProduct(null);
    }
  };

  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        {modo === 'view' ? (
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
            <label htmlFor="id">Id</label>
            <Input disabled value={data.venta_id} onChange={(e)=>set({...data, venta_id:e.target.value})}/>	
          </div>
        ): <></>}
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaHasta">Fecha</label>
          <DatePicker disable={true} fecha={(data.fecha_grabacion)} setFecha={ (fecha:string) => {set({...data,fecha_grabacion: fecha})} }/>
        </div>
        {
          data.anulada == true || data.anulada == 1? 
          (
            <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
              <label htmlFor="fechaAnulacion">Anulacion</label>
              <DatePicker disable={true} fecha={(data.fecha_anulacion)} setFecha={ (fecha:string) => {set({...data,fecha_anulacion: fecha})} }/>
            </div>
          ) : ( <> </> )
        }
        <div className='col-span-12 grid grid-cols-12 gap-4'>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
            <label htmlFor="cliente">Productos en Stock</label>
              <GenericSelect
                route="productos"
                value={optionProduct}
                onChange={(option) => seleccionarProducto(option)}
                placeHolder="Selec. producto"
                isDisabled={modo!='create'}
              />
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex items-center'>
            <Button disabled={modo!='create'} type="button" onClick={agregarProducto}>
              {load? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <Plus size={20}/>
              )} Agregar
            </Button>
          </div>
        </div>
      </div>
      <div className='pt-3'>
        <TableDetalles 
          datos={productos} 
          setDatos={(e:any)=> setProd(e)} 
          setTotal={controlarTotal} 
          quitar={quitarProducto}
          modo={modo}
        />
        {/*<div className="text-right font-bold text-lg mb-1">
          Total: {convertirNumberPlata(totalAux.toString())}
        </div>*/}
      </div>
    </div>
  );
}
//-----------------------------------------------------------------------------

interface PropsCli{
  data: Cliente;
  set: (e:any) => void;
  modo: string;
  setActivo: (e:boolean) => void;
  setTitle: (e:string) => void;
  setText: (e:string) => void;
  setColor: (e:string) => void;
}

export function DatosCliente({modo, data, set, setActivo, setTitle, setText, setColor}:PropsCli){
  const [dni, setDni]           = useState('');
  const [bloquear, setBloquear] = useState(false);
  const [found, setFound]       = useState(0);
  const [load, setLoad]         = useState(false);

  const buscarCliente = async () => {
    setLoad(true);
    if(!dni){
      setFound(0)
      setBloquear(false);
      set(clienteVacio);
      setLoad(false);
      return;
    }
    
    const res = await fetch(route('clientes.porDni',{dni: dni}));
    const cli = await res.json();
    setLoad(false);

    if(cli && cli.length > 0){
      setBloquear(true);
      set({...cli[0], fecha_nacimiento: convertirFechaGuionesBarras(cli[0].fecha_nacimiento)});
      setFound(1)
      setTitle('');
      setText('');
      setColor('warning');
      setActivo(false);
    }else {
      setFound(-1)
      setBloquear(false);
      set(clienteVacio);
      setTitle('Cliente no encontrado');
      setText('Ingresa los datos del cliente manualmente.');
      setColor('warning');
      setActivo(true);
    }
    setDni('');
  };
  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12 grid grid-cols-12 gap-4">
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
            <label htmlFor="dni">Documento</label>
            <InputDni 
              disabled={modo!='create'} 
              placeholder='Buscar por documento' 
              data={String(dni)} 
              setData={(nro) => setDni(nro) } 
              onChange={buscarCliente}/>
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-2 flex items-center'>
            <Button disabled={modo!='create'} type="button" onClick={buscarCliente}>
              { load ? (<Loader2 size={20} className="animate-spin mr-2" />) :  (<Search size={20}/>) }
              Buscar         
            </Button>
          </div>
          {
            found==-1?(
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex items-center'>
                 <Alert >
                  <AlertCircleIcon color="red"/>
                  <AlertTitle>Aviso!</AlertTitle>
                  <AlertDescription>
                    El cliente no se encuentra registrado, ingresa sus datos en el formulario.
                  </AlertDescription>
                </Alert>
                
              </div>
            ):(<></>)
          }
        </div>
        {modo === 'view' ? (
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
            <label htmlFor="id">Id</label>
            <Input disabled value={data.cliente_id} onChange={(e)=>set({...data, cliente_id:e.target.value})}/>	
          </div>
        ): <></>}
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
          <label htmlFor="nombre">Nombre</label>
          <Input disabled={bloquear || modo!=='create'} value={data.nombre} onChange={(e)=>set({...data, nombre:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="email">Email</label>
          <Input disabled={bloquear || modo!=='create'} value={data.email} onChange={(e)=>set({...data, email:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="dni">Documento</label>
          <InputDni disabled={bloquear || modo!=='create'} data={String(data.dni)} setData={(nro) => set({...data, dni: Number(nro)}) }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaHasta">Nacimiento</label>
          <DatePicker disable={bloquear || modo!=='create'} fecha={(data.fecha_nacimiento)} setFecha={ (fecha:string) => {set({...data,fecha_nacimiento: fecha})} }/>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="domicilio">Domicilio</label>
          <Input disabled={bloquear || modo!=='create'} value={data.domicilio} onChange={(e)=>set({...data, domicilio:e.target.value})}/>	
        </div>
      </div>
    </div>
  );
}
//-------------------------------------------------------------------------------
interface PropsFp{
  modo:                  string;
  //formasPagoHab:         Multiple[];
  formasPagoSelected:    FormPago[];
  //setFormaPagoSelected:  (array:any[]) => void;
  setFormaPagoSelected: React.Dispatch<React.SetStateAction<FormPago[]>>;
  totalVenta:            number;
  totalFp:               number;
  setTotalFp:            (e:number) => void;   
}
export function FormasPagosForm({modo, /*formasPagoHab,*/ formasPagoSelected, setFormaPagoSelected, totalVenta, totalFp, setTotalFp}:PropsFp){
  const fpVacio = { id: 0, nombre: '' }
  //const [fpId, setFpId]         = useState(0);
  const [monto, setMonto]       = useState(0);
  const [fp ,setFp]             = useState<{id: number, nombre: string}>(fpVacio);
  const [optionFp, setOptionFp] = useState<Autocomplete|null>(null);

  const agregarFp = () => {
    //controlo que el formulario se haya completado
    if(!fp.id || !monto){
      return
    }
    
    const estaEnArray = formasPagoSelected.find(e => e.id === fp.id);
    if(estaEnArray){
      setFormaPagoSelected((prev:any) => 
        prev.map((d:any) => 
          d.id === fp.id ? { ...d, monto: Number(d.monto) + Number(monto) } : d
        )
      );
    }else{
      setFormaPagoSelected([
        ...formasPagoSelected,
        {
          id: fp.id, 
          nombre: fp.nombre, 
          monto: monto, 
          fecha: (new Date()).toLocaleDateString(),
        }
      ]); 
    }
    
    //setFpId(0);
    setFp(fpVacio);
    setOptionFp(null);
    setMonto(0);
  };

  const quitarFp = (id:number) => {
    //quitar aqui y en los detalles del producto
    const aux:FormPago[] = formasPagoSelected.filter(e => e.id !== id);
    setFormaPagoSelected(aux);
  }

  const seleccionarFp = (option : any) => {
    if(option){
      //setFpId(option.value);
      setFp({id: option.value, nombre: option.label});
      setOptionFp(option);
    }else{
      //setFpId(0);
      setFp(fpVacio);
      setOptionFp(null);
    }
  };

  useEffect(() => { //calcula el total
    setTotalFp(formasPagoSelected.reduce((acc, fp) => acc + Number(fp.monto), 0));
  }, [formasPagoSelected]);

  return(
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        <form className="col-span-12" onSubmit={(e) => { e.preventDefault(); agregarFp(); }}>
          <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
              <label htmlFor="cliente">Forma de pago</label>
              <GenericSelect
                route="formas-pago"
                value={optionFp}
                onChange={(option) => seleccionarFp(option)}
                placeHolder='Selec. Forma de pago'
                isDisabled={modo!='create'}
              />
            </div>
            <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
              <label htmlFor="monto">Monto</label>
              {/*<Input disabled={modo!='create'} className='text-right' type='number' value={monto} onChange={(e)=> setMonto(Number(e.target.value))}/>*/}
              <NumericFormat 
                value={monto} 
                thousandSeparator="." 
                decimalSeparator="," 
                prefix="$" 
                className="text-right border rounded px-2 py-1" 
                onValueChange={(values) => { setMonto(values.floatValue || 0) }}
                onKeyDown={(e) => { if (e.key === "Enter") { 
                  e.preventDefault(); // 👈 evita el submit 
                  agregarFp(); 
                } }}
              />	
            </div>
            <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex items-center'>
              <Button type="button" onClick={agregarFp} disabled={totalVenta==0 || modo!='create'}>
                <Plus size={20}/> Agregar         
              </Button>
            </div>
          </div>
        </form>
        <div className="col-span-12">
          <TableFormasPago 
            modo={modo}
            datos={formasPagoSelected} 
            quitar={quitarFp}
          />
        </div>
        <div className="col-span-12 flex justify-center mb-2">
          <div className="p-2 rounded border">
            <span className="text-sm text-muted-foreground">Total</span><br />
            <span className="font-bold text-lg">${redondear(totalVenta, 2)}</span>
          </div>
          <div className="mx-4 p-2 rounded border border-blue-300 text-blue-700">
            <span className="text-sm text-muted-foreground">Acumulado</span><br />
            <span className="font-bold text-lg text-primary">$ {redondear(totalFp, 2)}</span>
          </div>
          <div className={`p-2 rounded border ${
              parseFloat(redondear(totalVenta - totalFp, 2)) > 0
                ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-100 dark:border-red-700'
                : 'text-green-700 border-green-500 dark:bg-green-800 dark:text-green-100 dark:border-green-800'
            }`}>
            <span className="text-sm">Pendiente</span><br />
            <span className="font-bold text-lg">$ {redondear(totalVenta - totalFp, 2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
//---------------------------------------------------------------------------------

export default function NewViewVenta(){
  //data
  const { mode, venta, detalles, cliente, formasPago, resultado, mensaje, venta_id, timestamp } = usePage().props as { 
    mode?:       string | 'create' | 'view';
    venta?:      Venta | undefined;
    detalles?:   Detalle[] | undefined;
    cliente?:    Cliente | undefined;
    formasPago?: FormPago[] | undefined;
    resultado?:  number;
    mensaje?:    string;
    venta_id?:   number;
    timestamp?:  number;
  };
  const { auth } = usePage<{auth: AuthProps}>().props;
  const [permiso, setPermiso] = useState(false);
  breadcrumbs[0].title = (mode=='create'? 'Nueva' : 'Ver')+' venta';
  /*const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    venta_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, venta_id: undefined });*/
  const [ultimoTimestamp, setUltimoTimestamp] = useState<Number | null>(null);

  const [ load, setLoad ] = useState(false);
  const { data, setData }                          = useForm<Venta>(ventaVacia);
  const {data: dataCli, setData: setDataCli }      = useForm<Cliente>(cliente??clienteVacio);
  //const {data: dataFp, setData: setDataFp }        = useForm<FormPago>(formaPagoVacia);
  const [totalFp, setTotalFp] = useState(0);
  //const [productosHab, setProductosHab]            = useState<ProductoHab[]>([]);
  const [productosDet, setProductosDet]            = useState<Detalle[]>(detalles??[]);
  //const [formasPagoHab, setFormasPagoHab]          = useState<Multiple[]>([]);
  const [formasPagoSelected,setFormasPagoSelected] = useState<FormPago[]>(formasPago??[]);

  const [confirmOpen, setConfirOpen]  = useState(false); //modal para confirmar acciones para cuado se crea
  const [textConfirm, setTextConfirm] = useState('');

  const [activo, setActivo] = useState(false);  //ShowMessage
  const [title, setTitle]   = useState('');
  const [text, setText]     = useState('');
  const [color, setColor]   = useState('success');

  //funciones

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    if(productosDet.length <= 0){
      setTitle('Campo requerido!');
      setText('Es necesario agregar al menos un producto para la venta.');
      setColor('warning');
      setActivo(true);
    
      return 
    }
    if(!dataCli.nombre || !dataCli.dni || !dataCli.email || !dataCli.fecha_nacimiento || !dataCli.domicilio){
      setTitle('Campo requerido!');
      setText('Se requiere rellenar todos los campos del cliente');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(formasPagoSelected.length <= 0){
      setTitle('Formas de Pago requeridas');
      setText('Es necesario agregar al menos una forma de pago.!');
      setColor('warning');
      setActivo(true);
      return 
    }
    if(parseFloat(redondear(data.total - totalFp,2)) > 0){
      setTitle('Pagos pendientes');
      setText('Es necesario completar los pagos para avanzar!');
      setColor('warning');
      setActivo(true);
      return
    }
    //pregunto
    setTextConfirm("Estás seguro de "+(mode==='create'?'grabar':'anular')+' esta venta?');
    setConfirOpen(true);
    //les doy a las fechas el formato que requiere la base
    setDataCli({...dataCli, fecha_nacimiento: convertirFechaBarrasGuiones(dataCli.fecha_nacimiento)});
    setDataCli('dni', dataCli.dni.toString())
    const aux = formasPagoSelected.map(e => ({...e, fecha:convertirFechaBarrasGuiones(e.fecha)}));
    setFormasPagoSelected(aux);
  };
  const grabarGuardar = () => {
    const payload = {
      ...dataCli,
      venta_id:        '',
      fecha_grabacion: convertirFechaBarrasGuiones(data.fecha_grabacion),
      venta_cliente_id:dataCli.cliente_id,
      fecha_anulacion: convertirFechaBarrasGuiones(data.fecha_anulacion)??'',
      total:           data.total,
      anulada:         false,
      detalles:        productosDet,
      formasPagos:     formasPagoSelected
    } 
    console.log("payload: ", payload)
    setConfirOpen(false);
    setTextConfirm('');
    setLoad(true);
    if(mode === 'create'){
      router.post(route('ventas.store'),payload,
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
      /*setTitle('');
      setText('');
      setActivo(false);*/
    }else {
      router.put(route('ventas.destroy',{venta: venta?.venta_id??0}),{motivo:'prueba'},
        {
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );
    }
  };
  
  const cancelar = () => {
    setConfirOpen(false);
  };

  //Effect
  useEffect(() => {
		//const cambioDetectado = (resultado && resultado  !== propsActuales.resultado) || (mensaje && mensaje    !== propsActuales.mensaje) 
    const cambioDetectado = timestamp && timestamp !== ultimoTimestamp;

		if (cambioDetectado) {
      //setPropsActuales({ resultado, mensaje, venta_id});
      setUltimoTimestamp(timestamp);

      const esError = resultado === 0;
      setTitle(esError ? 'Error' : mode === 'create' ? 'Venta nueva' : 'Venta Anulada');
      setText(esError ? mensaje ?? 'Error inesperado' : `${mensaje} (ID: ${venta_id})`);
      setColor(esError ? 'error' : 'success');
      setActivo(true); 
    }
	}, [resultado, mensaje, venta_id, timestamp, ultimoTimestamp]);

  useEffect(() => {
    if(venta && mode === 'view'){
      setData({
        venta_id:         venta?.venta_id,
        fecha_grabacion:  convertirFechaGuionesBarras(venta.fecha_grabacion)?? (new Date()).toLocaleDateString(),
        fecha_desde:      '',
        fecha_hasta:      '',
        cliente_id:       venta.cliente_id,
        cliente_nombre:   '',
        fecha_anulacion:  venta.fecha_anulacion? convertirFechaGuionesBarras(venta.fecha_anulacion) : '',
        total:            venta.total,
        anulada:          venta.anulada,
      });
      
      setDataCli({
        cliente_id:       cliente?.cliente_id,
        nombre:           cliente?.nombre,
        fecha_nacimiento: cliente?.fecha_nacimiento ? convertirFechaGuionesBarras(cliente?.fecha_nacimiento) : cliente?.fecha_nacimiento,
        domicilio:        cliente?.domicilio,
        email:            cliente?.email,
        dni:              cliente?.dni,
        inhabilitado:     cliente?.inhabilitado,
      });
      
    }else{
      setData(ventaVacia);
      setDataCli(clienteVacio);
    }
    setProductosDet(JSON.parse(JSON.stringify(detalles??[])));
    setFormasPagoSelected(JSON.parse(JSON.stringify(formasPago??[])));

    //verifico el permiso
    const aux = auth.permisos.filter(e => e === 'anular_venta');
    setPermiso(aux.length > 0);
  }, [venta, mode, detalles, formasPago, permiso]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nueva' : 'Ver')+' venta'} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <form 
            className='grid grid-cols-12 gap-1'
            onSubmit={handleSubmit}>
            <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                <div className='py-4 px-4'>
                  Datos del cliente
                  <hr />
                </div>
                <DatosCliente 
                  modo={mode??'create'}
                  data={dataCli}
                  set={setDataCli}
                  setActivo={setActivo}
                  setTitle={setTitle}
                  setText={setText}
                  setColor={setColor}/>
              </div>
              <div className='pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 bg-gray-100 dark:bg-neutral-900'>
                <div className='py-4 px-4'>
                  Detalles de la venta
                  <hr />
                </div>
                <DetallesVenta
                  modo={mode??'create'}
                  data={data}
                  set={setData}
                  productos={productosDet} //trabajo con una copia de los detalles
                  setProd={setProductosDet}
                  setTitle={setTitle}
                  setText={setText}
                  setColor={setColor}
                  setActivo={setActivo}
                />
              </div>
              <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                <div className='py-4 px-4'>
                  Formas de pago
                  <hr />
                </div>
                <FormasPagosForm
                  modo={mode??'create'}
                  //formasPagoHab={formasPagoHab}
                  formasPagoSelected={formasPagoSelected}
                  setFormaPagoSelected={setFormasPagoSelected}
                  totalVenta={data.total}
                  totalFp={totalFp}
                  setTotalFp={(x) => setTotalFp(x)}
                />
              </div>
            </div>
            {
              !data.anulada ? (
                <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                  {/*permiso && (
                    <Button type="button" onClick={handleSubmit} className={mode!='create'? 'bg-red-600 hover:bg-red-700 text-white' : ''}>
                      { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                              ( mode === 'create'? (<Save size={20} className=""/>) : (<Ban size={20} className=""/>) )}
                      { ( mode === 'create' ? 'Grabar' : 'Anular')  }          
                    </Button>
                  )*/}
                  {
                    mode === 'create' ? (
                      <Button type="button" onClick={handleSubmit}>
                        { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                                ( <Save size={20} className=""/> )}
                        Grabar
                      </Button>
                    ) : (
                      <>
                        {permiso && (
                          <Button type="button" onClick={handleSubmit} className='bg-red-600 hover:bg-red-700 text-white'>
                            { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                                    (<Ban size={20} className=""/>) }
                            Anular       
                          </Button>
                        )}
                      </>
                    )
                  }
                </div>
              ): (<></>)
            }
          </form>
        </div>
      </div>
      <ModalConfirmar
        open={confirmOpen}
        text={textConfirm}
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
            if (resultado === 1 && (venta_id||venta)){
              router.get(route('ventas.view', { venta: venta_id??venta?.venta_id }));
            }
          }
        }
      />
    </AppLayout>
  );
}