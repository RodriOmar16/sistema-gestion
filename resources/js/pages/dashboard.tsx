import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import GraficoBarras from '@/components/utils/grafico-barras';
import GraficoTortas from '@/components/utils/grafico-tortas';
import GraficoLineas from '@/components/utils/grafico-lineas';
import { route } from 'ziggy-js';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { DatePicker } from '@/components/utils/date-picker';
import { convertirFechaBarrasGuiones, convertirNumberPlata, formatDate, redondear } from '@/utils';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import GraficoRankin from '@/components/utils/grafico-ranking';


const breadcrumbs: BreadcrumbItem[] = [ { title: 'Gráficos', href: '', } ];

interface PropsMenu{
  set: (ob:string) => void;
  tipoGrafico: string;
}

interface PropsForm {
  dia?: string;
  anio: number;
  mes?: number;
  tipo: number;
}

const propVacio : PropsForm = {
  dia:  formatDate(new Date()), 
  anio: 0, 
  mes:  new Date().getMonth() + 1, 
  tipo: 3,
}

export default function Graficos(){
  //data  
  const [load, setLoad]   = useState(false);
  const [data, setData]   = useState<PropsForm>(propVacio);
  const [anios, setAnios] = useState<{id: number, anio:number}[]>([]);
  const [datos, setDatos] = useState([]);
  const tipos = [ {id: 1, tipo: 'Día'}, {id: 2, tipo: 'Mes'}, {id: 3, tipo: 'Año'} ]
  const meses = [ 
    {id: 1, nombre: 'Enero'},    {id: 2, nombre: 'Febrero'},     {id: 3, nombre: 'Marzo'}, 
    {id: 4, nombre: 'Abril'},    {id: 5, nombre: 'Mayo'},    {id: 6, nombre: 'Junio'},
    {id: 7, nombre: 'Julio'},    {id: 8, nombre: 'Agosto'},    {id: 9, nombre: 'Septiembre'},
    {id: 10, nombre: 'Octubre'},    {id: 11, nombre: 'Noviembre'},    {id: 12, nombre: 'Diciembre'}
  ];
  const [modo, setModo] = useState(false);
  const [totalFinal, setTotalFinal] = useState(0);
  const [cantFinal, setCantFinal]   = useState(0);
  const [promedio, setPromedio]     = useState(0);
  //
  const [datosProd, setDatosProd]           = useState([]); 
  const [datosProdTotal, setDatosProdTotal] = useState([]); 
  const [gastos, setGastos] = useState([]);

  //
  const [tab, setTab] = useState<'ventas' | 'productos' | 'gastos'>('ventas');


  //useEffect
  useEffect(() => {
    const cargarDatos = async () => {
      const [resAnios] = await Promise.all([
        fetch(route('ventas.getAnios'))
      ]);
      const anios = await resAnios.json();
      setAnios(anios);

      const aux = anios.find((e:any) => e.anio === new Date().getFullYear());
      if (aux) {
        const nuevo = {...data, anio: aux.id};
        setData(nuevo);
        obtenerData(nuevo); // se dispara con el estado actualizado
      }
    };
    cargarDatos();
  }, []);


  //funciones
  const obtenerData = async (form: PropsForm) => {
    const payload = {
      ...form,
      dia: convertirFechaBarrasGuiones(form.dia??''),
      anio: anios.find((e:any) => e.id === form.anio)?.anio ?? (new Date().getFullYear())
    }
    setLoad(true);
    const [res, resp] = await Promise.all([
      fetch(route('ventas.getDatos',{...payload})),
      fetch(route('ventas.getDatosProductos',{...payload}))
    ]);
    const data = await res.json();
    setLoad(false);
    setDatos(data.arr);
    setTotalFinal(data.total_final);
    setCantFinal(data.cantidad_final);
    setPromedio(data.cantidad_final === 0 ? 0 : Math.round(data.total_final/data.cantidad_final * 100) / 100 );
    
    const dataProductos = await resp.json();
    setDatosProd(dataProductos.arr);
    setDatosProdTotal(dataProductos.arr2);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gráficos" />
      {/* --- */}
      <div>
        <div className="p-4">
          {/* Botones de pestañas */}
          <div className="flex space-x-4 border-b">
            <button
              className={`pb-2 ${tab === 'ventas' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('ventas')}
            >
              Ventas
            </button>
            <button
              className={`pb-2 ${tab === 'productos' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('productos')}
            >
              Productos
            </button>
            <button
              className={`pb-2 ${tab === 'gastos' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('gastos')}
            >
              Gastos
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-12 gap-2 overflow-x-auto rounded-xl p-4">
            <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
              <label htmlFor="tipo">Selec. Tipo</label>
              <Select
                value={String(data.tipo)}
                onValueChange={(value) => {
                  const nuevo = {...data, 'tipo': Number(value)}
                  setData(nuevo);
                  obtenerData(nuevo);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tipos.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {String(e.tipo)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {
              (data.tipo !=3 && data.tipo !=1) && (
                <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
                  <label htmlFor="padre">Selec. Mes</label>
                  <Select
                    value={String(data.mes)}
                    onValueChange={(value) => {
                      const nuevo = {...data, 'mes': Number(value)};
                      setData(nuevo);
                      obtenerData(nuevo);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {meses.map((e: any) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {String(e.nombre)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )
            }
            {
              data.tipo != 1 && (
                <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2 lg:col-span-2">
                  <label htmlFor="anio">Selec. Año</label>
                  <Select
                    value={String(data.anio)}
                    onValueChange={(value) => {
                      const nuevo = {...data, 'anio': Number(value)};
                      setData(nuevo);
                      obtenerData(nuevo);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {anios.map((e: any) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {String(e.anio)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )
            }
            {
              data.tipo == 1 && (
                <div className="col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-2">
                  <label htmlFor="fechaDesde">Fecha</label>
                  <DatePicker fecha={data.dia??''} setFecha={ (fecha:string) => {
                    const nuevo = {...data,dia: fecha};
                    setData(nuevo)
                    obtenerData(nuevo);
                  } }/>
                </div>
              )
            }
            <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
              <label className='mr-2'>Totales</label>
              <Switch checked={modo} onCheckedChange={(val) => setModo(val)} />
            </div>
          </div>

          {/* Contenido dinámico */}
          {tab === 'ventas' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 px-4">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl border p-4 text-center">
                  <h3 className="text-sm text-gray-800 dark:text-white">Ganancias</h3>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {load? '...' : convertirNumberPlata(String(totalFinal))}
                  </p>
                </div>
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl border p-4 text-center">
                  <h3 className="text-sm text-gray-800 dark:text-white">Ventas</h3>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{load? '...' : cantFinal}</p>
                </div>
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl border p-4 text-center">
                  <h3 className="text-sm text-gray-800 dark:text-white">Promedio</h3>
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{load? '...' : convertirNumberPlata(String(promedio))}</p>
                </div>
              </div>

              <div className="flex items-center justify-center mx-4 overflow-auto rounded-xl h-80 border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                {datos.length === 0 && !load && (
                  <div className='ml-4 my-3 text-center'>
                    No hay datos para mostrar
                  </div>
                )}
                { load && (
                  <div className='ml-4 my-3 text-center flex items-center'>
                    <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
                  </div>
                )}
                {datos.length > 0 && !load && (
                  <>
                    {data.tipo == 1 && (
                      <GraficoBarras tipo={data.tipo} modo={modo} data={datos} ejeX='name' ejeY={modo? 'total' : 'cantidad'} color="#cd8e19"/>
                    )}
                    {data.tipo == 2 && (
                      <GraficoBarras tipo={data.tipo} modo={modo} data={datos} ejeX='name' ejeY={modo? 'total' : 'cantidad'} color="#4e89a3"/>
                    )}
                    {data.tipo == 3 && (
                      <GraficoLineas
                        data={datos} 
                        tipo={data.tipo} modo={modo}
                        name='name' 
                        valor={modo? 'total' : 'cantidad'}
                        color="#8782ca"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'productos' && (
            <div>
              <div className=" flex items-center justify-center mx-4 overflow-auto rounded-xl h-80 border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                {datosProd.length === 0 && !load && (
                  <div className='ml-4 my-3 text-center'>
                    No hay datos para mostrar
                  </div>
                )}
                { load && (
                  <div className='ml-4 my-3 text-center flex items-center'>
                    <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
                  </div>
                )}
                {datosProd.length > 0 && !load && (
                  <>
                    <div className='flex gap-4 grid grid-cols-12'>
                      {/* Gráficos */}
                      <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-7">
                        <GraficoRankin data={modo? datosProdTotal : datosProd} ejeX={modo? 'total' : 'cantidad'} ejeY='name' color="#19cd9d" altura={450}/>
                      </div>
                      {/* Tablas */}
                      <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-5 pt-4 pr-4">
                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                          <thead>
                            <tr className="bg-gray-200 dark:bg-gray-800">
                              <th className="border px-2 py-1">Nombre</th>
                              <th className="border px-2 py-1">Cantidad</th>
                              <th className="border px-2 py-1">Precio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(modo? datosProdTotal : datosProd).map((item:any, i) => (
                              <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                                <td className="border px-2 py-1">{item.name}</td>
                                <td className="border px-2 py-1 text-center">{item.cantidad}</td>
                                <td className="border px-2 py-1 text-right">{(Number(item.total)/item.cantidad).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'gastos' && (
            <div>
              <div className=" flex items-center justify-center mx-4 overflow-auto rounded-xl h-80 border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                {datosProd.length === 0 && !load && (
                  <div className='ml-4 my-3 text-center'>
                    No hay datos para mostrar
                  </div>
                )}
                { load && (
                  <div className='ml-4 my-3 text-center flex items-center'>
                    <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
                  </div>
                )}
                {gastos.length > 0 && !load && (
                  <>
                    
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* --- */}
      
      

    </AppLayout>
  );
}