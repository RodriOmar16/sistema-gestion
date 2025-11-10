import AppLayout from '@/layouts/app-layout';
import { Venta, Cliente } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus, Search } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table"
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import SelectMultiple from '@/components/utils/select-multiple';
import { Multiple } from '@/types/typeCrud';
import { convertirNumberPlata, ordenarPorTexto } from '@/utils';
import ShowMessage from '@/components/utils/showMessage';
import ModalConfirmar from '@/components/modalConfirmar';
import { route } from 'ziggy-js';
import { DatePicker } from '@/components/utils/date-picker';
import TableDetalles from '@/components/ventas/tableDetalles';
import Autocomplete from '@/components/utils/autocomplete';
import InputDni from '@/components/utils/input-dni';

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


type ProductoHab = {
  id: number; 
  nombre: string, 
  precio: number, 
};
interface PropsDet{
  data: Venta;
  set: (e:any) => void;
  modo: string;
  productos: Detalle[];
  setProd: (e:any) => void;
  productosHab: ProductoHab[];
};
export function DetallesVenta({modo, data, set, productosHab, productos,setProd}:PropsDet){
  const [totalAux, setTotalAux] = useState(0); 
  const [productoId, setProdId] = useState(0);
  
  const controlarTotal = (e:number) => {
    setTotalAux(e);
    set({...data, total:Number(e)})
  };

  const agregarProducto = () => {
    if(productoId===0){
      return;
    }
    if(productos.length == 0){
      setProd((prev:any) => [...prev, {
        id: productoId, 
        nombre: productosHab.find(e => e.id === productoId)?.nombre, 
        precio: productosHab.find(e => e.id === productoId)?.precio, 
        cantidad: 1
      }]);
      setProdId(0);
      return 
    }

    const obj = productos.find(e => e.id === productoId)
    if(obj){
      setProd((prev:any) =>
        prev.map((d:any) =>
          d.id === productoId ? { ...d, cantidad: d.cantidad + 1 } : d
        )
      );
    } else {
      const producto = productosHab.find(e => e.id === productoId);
      if (producto) {
        setProd((prev:any) => [
          ...prev,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
          },
        ]);
      }
    }
    setProdId(0);
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
            <label htmlFor="cliente">Productos</label>
              <Select
                value={String(productoId)}
                onValueChange={(value) => setProdId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {productosHab.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex items-center'>
            <Button type="button" onClick={agregarProducto}>
                <Plus size={20}/> Agregar
              </Button>
          </div>
        </div>
      </div>
      <div className='pt-3'>
        <TableDetalles datos={productos} setTotal={controlarTotal} />
        <div className="text-right font-bold text-lg mt-4">
          Total: {convertirNumberPlata(totalAux.toString())}
        </div>
      </div>
    </div>
  );
}
//-----------------------------------------------------------------------------

interface PropsCli{
  data: Cliente;
  set: (e:any) => void;
  modo: string;
}

export function DatosCliente({modo, data, set}:PropsCli){
  const [dni, setDni] = useState('');
  const [bloquear, setBloquear] = useState(false);
  const buscarCliente = async () => {
    if(!dni){
      setBloquear(false);
      set(clienteVacio);
      return;
    }
    const res = await fetch(route('clientes.porDni',{dni: dni}));
    const cli = await res.json();
    
    if(cli && cli.length > 0){
      setBloquear(true);
      set(cli[0]);
    }else {
      setBloquear(false);
      set(clienteVacio);
    }
    setDni('');
  };
  return (
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12 grid grid-cols-12 gap-4">
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
            <label htmlFor="dni">Documento</label>
            <InputDni placeholder='Buscar por documento' data={String(dni)} setData={(nro) => setDni(nro) }/>
          </div>
          <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex items-center'>
            <Button type="button" onClick={buscarCliente}>
              <Search size={20}/> Buscar         
            </Button>
          </div>
        </div>
        {modo === 'view' ? (
          <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
            <label htmlFor="id">Id</label>
            <Input disabled value={data.cliente_id} onChange={(e)=>set({...data, cliente_id:e.target.value})}/>	
          </div>
        ): <></>}
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5'>
          <label htmlFor="nombre">Nombre</label>
          <Input disabled={bloquear} value={data.nombre} onChange={(e)=>set({...data, nombre:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-4'>
          <label htmlFor="email">Email</label>
          <Input disabled={bloquear} value={data.email} onChange={(e)=>set({...data, email:e.target.value})}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="dni">Documento</label>
          <InputDni disabled={bloquear} data={String(data.dni)} setData={(nro) => set({...data, dni: Number(nro)}) }/>
        </div>
        <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
          <label htmlFor="fechaHasta">Nacimiento</label>
          <DatePicker disable={bloquear} fecha={(data.fecha_nacimiento)} setFecha={ (fecha:string) => {set({...data,fecha_nacimiento: fecha})} }/>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="domicilio">Domicilio</label>
          <Input disabled={bloquear} value={data.domicilio} onChange={(e)=>set({...data, domicilio:e.target.value})}/>	
        </div>
      </div>
    </div>
  );
}
//-------------------------------------------------------------------------------
interface PropsFp{
  formasPagoHab: Multiple[],
  formasPagoSelected:    FormPago[],
  setFormaPagoSelected: (array:any[]) => void
}
export function FormasPagosForm({formasPagoHab, formasPagoSelected, setFormaPagoSelected}:PropsFp){
  const [fpId, setFpId] = useState(0);
  const [monto, setMonto] = useState(0);
  const agregaFp = () => {
    if(!fpId || !monto){
      return
    }
    //agregar
    console.log("agregar: ", fpId, monto)    
    setFpId(0);
    setMonto(0);
  };

  return(
    <div className='px-4'>
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3'>
          <label htmlFor="cliente">Forma de pago</label>
          <Select
            value={String(fpId)}
            onValueChange={(value) => setFpId(Number(value)) }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {formasPagoHab.map((e: any) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
          <label htmlFor="monto">Monto</label>
          <Input className='text-right' type='number' value={monto} onChange={(e)=> setMonto(Number(e.target.value))}/>	
        </div>
        <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 flex items-center'>
          <Button type="button" onClick={agregaFp}>
            <Plus size={20}/> Agregar         
          </Button>
        </div>
        <div className="col-span-12 ">
          {/* crear el datable table de las formas de pago aquí */}
        </div>
      </div>
    </div>
  );
}
//---------------------------------------------------------------------------------
type Detalle  = {id: number, nombre:string, precio:number , cantidad: number };
type FormPago = {id: number, nombre: string, monto: number, fecha: string};

export default function NewViewVenta(){
  //data
  const [ load, setLoad ] = useState(false);
  const { mode, venta, detalles, cliente, formasPago } = usePage().props as { 
    mode?:       string | 'create' | 'view';
    venta?:      Venta | undefined;
    detalles?:   Detalle[] | undefined;
    cliente?:    Cliente | undefined;
    formasPago?: FormPago[] | undefined;
  };
  breadcrumbs[0].title = (mode=='create'? 'Nueva' : 'Ver')+' venta';
  const [propsActuales, setPropsActuales] = useState<{
    resultado: number | undefined | null;
    mensaje: string | undefined | null | '';
    venta_id: number | undefined | null;
  }>({ resultado: undefined, mensaje: undefined, venta_id: undefined });

  const { data, setData }                          = useForm<Venta>(ventaVacia);
  const {data: dataCli, setData: setDataCli }      = useForm<Cliente>(cliente??clienteVacio);
  const {data: dataFp, setData: setDataFp }        = useForm<FormPago>(formaPagoVacia);
  const [productosHab, setProductosHab]            = useState<ProductoHab[]>([]);
  const [productosDet, setProductosDet]            = useState<Detalle[]>(detalles??[]);
  const [formasPagoHab, setFormasPagoHab]          = useState<Multiple[]>([]);
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
    /* que la cantidad de los elementos sea mayor que 0 */
    /* Controlar que el total de ventas sea el total de las formas de pago */

    setTextConfirm("Estás seguro de "+(mode==='create'?'grabar':'actualizar')+' esta venta?');
    setConfirOpen(true);
  };
  const grabarGuardar = () => {
    //reseteo el confirmar    
   /* setConfirOpen(false);
    setTextConfirm('');
    //muestro el cargando...
    setLoad(true);
    console.log("procedo a guardar o grabar");
    const payload = {
      ...data,
      categorias: catSelected,
      listas: listas
    };
    console.log("payload: ", payload)
    if (mode === 'create') {
      router.post(
        route('productos.store'),payload,
        {
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

  //Effect
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProductos, resFp] = await Promise.all([
          fetch(route('productos.productosHabilitados')),
          fetch(route('formasPago.habilitadas'))
        ]);

        const productos = await resProductos.json();
        const fps       = await resFp.json();

        setProductosHab(ordenarPorTexto(productos,'nombre'));
        setFormasPagoHab(ordenarPorTexto(fps,'nombre'));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if(venta && mode === 'view'){
      //console.log("producto: ", producto)
      setData({
        venta_id:         venta?.venta_id,
        fecha_grabacion:  venta.fecha_grabacion?? (new Date()).toLocaleDateString(),
        fecha_desde:      '',
        fecha_hasta:      '',
        cliente_id:       venta.cliente_id,
        cliente_nombre:   '',
        fecha_anulacion:  venta.fecha_anulacion,
        total:            venta.total,
        anulada:          venta.anulada,
      });
      
      setDataCli({
        cliente_id:       cliente?.cliente_id,
        nombre:           cliente?.nombre,
        fecha_nacimiento: cliente?.fecha_nacimiento,
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
  }, []);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={(mode=='create'? 'Nueva' : 'Ver')+' venta'} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="relative flex-none flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <form 
            className='grid grid-cols-12 gap-1'
            onSubmit={handleSubmit}>
            <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4 px-4'>
                Detalles de la venta
                <hr />
              </div>
              <DetallesVenta
                modo={mode??'create'}
                data={data}
                set={setData}
                productosHab={productosHab}
                productos={productosDet} //trabajo con una copia de los detalles
                setProd={setProductosDet}
              />
            </div>
            <div className='pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4 px-4'>
                Datos del cliente
                <hr />
              </div>
              <DatosCliente 
                modo={mode??'create'}
                data={dataCli}
                set={setDataCli}/>
            </div>
            <div className='px-4 pb-1 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <div className='py-4'>
                Formas de pago
                <hr />
              </div>
              <FormasPagosForm
                formasPagoHab={formasPagoHab}
                formasPagoSelected={formasPagoSelected}
                setFormaPagoSelected={setFormasPagoSelected}
              />
            </div>
            <div  className='flex justify-end px-4 pb-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
              <Button type="button" onClick={handleSubmit}>
                { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                         (<Save size={20} className=""/>)  }
                { ( mode === 'create' ? 'Grabar' : 'Actualizar')  }          
              </Button>
            </div>
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
            /*if (resultado === 1 && venta_id){
              router.get(route('ventas.view', { venta: venta_id }));
            }*/
          }
        }
      />
    </AppLayout>
  );
}