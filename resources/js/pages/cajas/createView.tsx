import AppLayout from '@/layouts/app-layout';
import { Autocomplete, Caja } from "@/types/typeCrud";
import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Barcode, Ban } from 'lucide-react';
import {  Table,  TableBody,  TableCaption,  TableCell,  TableHead,  TableHeader,  TableRow,
} from "@/components/ui/table";
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
  inhabilitado:       0,
  abierta:            0,
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

  useEffect(() => {
    if(caja && mode === 'edit'){
      console.log("caja recibida: ", caja)
      console.log("egresos: ", egresos )
      console.log("ingresos: ", ingresos )
      setData({
        ...caja,
        fecha: convertirFechaGuionesBarras(caja.fecha),
      });
    }
  }, [mode, caja]);

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
    
    data.diferencia = Number(data.total_sistema) - Number(data.total_user);
    console.log("data al final: ", data)
    setTextConfirm("Estás seguro de finalizar la caja?");
    setConfirOpen(true);
  };

  const grabarGuardar = () => {
    //reseteo el confirmar    
    setConfirOpen(false);
    setTextConfirm('');

    //muestro el cargando...
    setLoad(true); 
    
    const payload = {
      ...data,
    };

    if (mode === 'create') {
      /*router.post(
        route('productos.store'),payload,
        {
          //forceFormData: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            setLoad(false);
          }
        }
      );*/
      console.log("entro por error")
    } else {
      router.put(
        route('caja.update',{caja: data.caja_id}),
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
    setActivo(false);
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
                    className="text-right border rounded-md px-2 py-1" 
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
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2'>
                  <label htmlFor="id">Id</label>
                  <Input disabled value={data.caja_id} onChange={(e)=>setData({...data, caja_id:e.target.value})}/>	
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3'>
                  <label htmlFor="turno_nombre">Turno</label>
                  <Input disabled value={data.turno_nombre}/>	
                </div>
                <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-3">
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
                  <div className='py-2 px-4 bg-sky-700 dark:bg-sky-900 text-white font-semibold rounded-t'>
                    Según el sistema
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Efectivo</TableHead>
                        <TableHead>Débito</TableHead>
                        <TableHead>Transferencia</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Ingresos</TableCell>
                        <TableCell>{convertirNumberPlata(String(data.efectivo))}</TableCell>
                        <TableCell>{convertirNumberPlata(String(data.debito))}</TableCell>
                        <TableCell>{convertirNumberPlata(String(data.transferencia))}</TableCell>
                        <TableCell className="text-right">{convertirNumberPlata(String( data.efectivo + data.debito + data.transferencia ))}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Egresos</TableCell>
                        <TableCell>{convertirNumberPlata(String((egresos ? egresos[0].valor : '')))}</TableCell>
                        <TableCell>{convertirNumberPlata(String((egresos ? egresos[1].valor : '')))}</TableCell>
                        <TableCell>{convertirNumberPlata(String((egresos ? egresos[2].valor : '')))}</TableCell>
                        <TableCell className="text-right">{convertirNumberPlata(String( 
                          egresos ? egresos[0].valor + egresos[1].valor + egresos[2].valor : ''
                        ))}</TableCell>
                      </TableRow>
                      <TableRow className='bg-gray-100 dark:bg-black'>
                        <TableCell colSpan={4} className='font-medium text-right'> Total:</TableCell>
                        <TableCell className="font-medium text-left" colSpan={1} > {convertirNumberPlata(String(data.total_sistema))} </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
                  <div className="py-2 px-4 bg-blue-800 dark:bg-blue-900 text-white font-semibold rounded-t">
                    Según el usuario
                  </div>
                  <Table className="w-full border border-gray-300 dark:border-black">
                    <TableBody>
                      <TableRow className="">
                        <TableCell className="font-medium">Efectivo</TableCell>
                        <TableCell>
                          {data.abierta === 1 ? (
                            <NumericFormat 
                              value={data.efectivo_user} prefix="$" 
                              thousandSeparator="." decimalSeparator="," 
                              className="text-right border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              onValueChange={(values) => { 
                                const nuevo = values.floatValue || 0;
                                setData({...data, efectivo_user: nuevo});
                                setData('total_user', (Number(nuevo) + Number(data.debito_user) + Number(data.transferencia_user))) 
                              }}
                            />	
                          ) : (
                            convertirNumberPlata(String(data.efectivo_user))
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="">
                        <TableCell className="font-medium">Débito</TableCell>
                        <TableCell>
                          {data.abierta === 1 ? (
                            <NumericFormat 
                              value={data.debito_user} prefix="$" 
                              thousandSeparator="." decimalSeparator="," 
                              className="text-right border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              onValueChange={(values) => { 
                                const nuevo = values.floatValue || 0;
                                setData({...data, debito_user: nuevo});
                                setData('total_user', (Number(nuevo) + Number(data.efectivo_user) + Number(data.transferencia_user))) 
                              }}
                            />
                          ): ( convertirNumberPlata(String(data.debito_user)) )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="">
                        <TableCell className="font-medium">Transferencia</TableCell>
                        <TableCell>
                          {data.abierta === 1 ? (
                            <NumericFormat 
                              value={data.transferencia_user} prefix="$" 
                              thousandSeparator="." decimalSeparator="," 
                              className="text-right border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              onValueChange={(values) => { 
                                const nuevo = values.floatValue || 0;
                                setData({...data, transferencia_user: nuevo});
                                setData('total_user', (Number(nuevo) + Number(data.efectivo_user) + Number(data.debito_user)))
                              }}
                            />
                          ): ( convertirNumberPlata(String(data.transferencia_user)) )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-100 dark:bg-black">
                        <TableCell className="font-semibold text-right">Total:</TableCell>
                        <TableCell className="font-bold text-left">
                          {convertirNumberPlata(String(data.total_user))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div  className={`py-2 pl-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 ${data.total_sistema - data.total_user > 0 ? 'bg-red-500 dark:bg-red-700' : 'bg-green-500 dark:bg-green-700'}`}>
                    Diferencia:{convertirNumberPlata(String(data.total_sistema - data.total_user))}
                </div>
                <div className='col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-12'>
                  Descripción
                  <Textarea 
                    id="descripcion" 
                    placeholder="Escribe una comentario..." 
                    value={data.descripcion}
                    disabled={data.abierta === 0}
                    onChange={(e) => setData({...data, descripcion: e.target.value})}
                  />
                </div>
                {data.fecha === (new Date()).toLocaleDateString() && data.inhabilitado == 0 && (
                  <div  className='flex justify-end px-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                    <Button type="button" className='bg-red-500 hover:bg-red-800 text-white' onClick={handleSubmit}>
                      { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                                (<Ban size={20} className=""/>)  }
                      Inhabilitar
                    </Button>
                  </div>
                )}
                {data.abierta === 1 && data.inhabilitado == 0 && (
                  <div  className='flex justify-end px-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
                    <Button type="button" onClick={handleSubmit}>
                      { load ? ( <Loader2 size={20} className="animate-spin"/> ) : 
                                (<Save size={20} className=""/>)  }
                      Finalizar
                    </Button>
                  </div>
                )}
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
              router.get(route('caja.show', { caja: caja_id }));
            }
          }
        }
      />
    </AppLayout>
  );
}