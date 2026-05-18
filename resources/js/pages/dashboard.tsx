import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Select,  SelectContent,  SelectGroup,  SelectItem,  SelectLabel,  SelectTrigger,  SelectValue } from "@/components/ui/select"
import { DatePicker } from '@/components/utils/date-picker';
import { convertirFechaBarrasGuiones, convertirNumberPlata, formatDate, redondear } from '@/utils';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Bar, CartesianGrid, ComposedChart, LabelList, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { Legend } from '@headlessui/react';
import DashboardVentas from '@/components/dashboard/dashboardVentas';
import DashboardProductos from '@/components/dashboard/dashboardProductos';
import DashboardGastos from '@/components/dashboard/dashboardGastos';
import DashboardBalances from '@/components/dashboard/dashboardBalances';


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
  const tiposBalance = [ {id: 2, tipo: 'Mes'}, {id: 3, tipo: 'Año'} ]
  const meses = [ 
    {id: 1, nombre: 'Enero'},    {id: 2, nombre: 'Febrero'},     {id: 3, nombre: 'Marzo'}, 
    {id: 4, nombre: 'Abril'},    {id: 5, nombre: 'Mayo'},    {id: 6, nombre: 'Junio'},
    {id: 7, nombre: 'Julio'},    {id: 8, nombre: 'Agosto'},    {id: 9, nombre: 'Septiembre'},
    {id: 10, nombre: 'Octubre'},    {id: 11, nombre: 'Noviembre'},    {id: 12, nombre: 'Diciembre'}
  ];
  const [tema, setTema] = useState('');
  const [modo, setModo] = useState(false);
  const [totalFinal, setTotalFinal] = useState(0);
  const [cantFinal, setCantFinal]   = useState(0);
  const [promedio, setPromedio]     = useState(0);
  //
  const [datosProd, setDatosProd]           = useState([]); 
  const [datosProdTotal, setDatosProdTotal] = useState([]); 
  //
  const [gastos, setGastos] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  const [cantGastos, setCantGastos] = useState(0);
  //
  const [balances, setBalances] = useState<{balance: number, ventas: number, gastos: number}[]>([]);
  //
  const [tab, setTab] = useState<'ventas' | 'productos' | 'gastos' | 'balances'>('ventas');

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
    setTema(localStorage.getItem('appearance')??'light');
  }, []);


  //funciones
  const obtenerData = async (form: PropsForm) => {
    const payload = {
      ...form,
      dia: convertirFechaBarrasGuiones(form.dia??''),
      anio: anios.find((e:any) => e.id === form.anio)?.anio ?? (new Date().getFullYear())
    }

    setLoad(true);
    const [res, resp, respGasosCategorias, respGastos] = await Promise.all([
      fetch(route('ventas.getDatos',{...payload})),
      fetch(route('ventas.getDatosProductos',{...payload})),
      fetch(route('gastos.getGatosCategorias', {...payload})),
      fetch(route('gastos.getGatos', {...payload}))
    ]);
    const data = await res.json();
    setLoad(false);

    //ventas
    setDatos(data.arr);
    setTotalFinal(data.total_final);
    setCantFinal(data.cantidad_final);
    setPromedio(data.cantidad_final === 0 ? 0 : Math.round(data.total_final/data.cantidad_final * 100) / 100 );
    //productos ranking
    const dataProductos = await resp.json();
    setDatosProd(dataProductos.arr);
    setDatosProdTotal(dataProductos.arr2);
    //categorias gastos
    const dataGastosCategorias = await respGasosCategorias.json();
    setTotalGastos(dataGastosCategorias.total_final);
    setCantGastos(dataGastosCategorias.cantidad_final);
    setGastos(dataGastosCategorias.arr.map((e:any) => ({
      ...e,
      total: Number(e.total)
    })));
    //Balance
    const gastosVentas = await respGastos.json();
    console.log("gastosVentas: ", gastosVentas)
    setBalances(gastosVentas);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gráficos" />
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
              className={`pb-2 ${tab === 'gastos' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('gastos')}
            >
              Gastos
            </button>
            <button
              className={`pb-2 ${tab === 'productos' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('productos')}
            >
              Productos
            </button>
            <button
              className={`pb-2 ${tab === 'balances' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
              onClick={() => setTab('balances')}
            >
              Balances
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
                    {(tab =='balances'? tiposBalance : tipos).map((e: any) => (
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
              tab != 'balances' && data.tipo == 1 && (
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
            {tab === 'productos' && <div className='col-span-6 sm:col-span-4 md:col-span-4 lg:col-span-3 flex flex-col'>
              <label className='mr-2'>Totales</label>
              <Switch checked={modo} onCheckedChange={(val) => setModo(val)} />
            </div>}
          </div>

          {/* Contenido dinámico */}
          {tab === 'ventas' && (
            <DashboardVentas
              data={data}
              datos={datos}
              load={load}
              cantFinal={cantFinal}
              totalFinal={totalFinal}
              promedio={promedio}
              tema={tema}
              modo={modo}
            />
          )}

          {tab === 'productos' && (
            <DashboardProductos
              load={load}
              datosProd={datosProd}
              modo={modo}
              datosProdTotal={datosProdTotal}
            />
          )}

          {tab === 'gastos' && (
            <DashboardGastos
              gastos={gastos}
              load={load}
              cantGastos={cantGastos}
              totalGastos={totalGastos}
              tema={tema}
            />
          )}
          
          {tab === 'balances' && (
            <DashboardBalances
              balances={balances}
              load={load}
            />
          )}
        </div>
      </div>
      {/* --- */}
    </AppLayout>
  );
}