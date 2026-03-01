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
import { convertirFechaBarrasGuiones, formatDate } from '@/utils';
import { Loader2 } from 'lucide-react';


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
  /*const [data, setData] = useState<any[]>([
    { name: 'Enero', ventas: 12000 },
    { name: 'Febrero', ventas: 9000 },
    { name: 'Marzo', ventas: 18000 },
    { name: 'Mayo', ventas: 20000 },
    { name: 'Junio', ventas: 11000 },
    { name: 'Julio', ventas: 13500 },
    { name: 'Agosto', ventas: 9000 },
    { name: 'Septiembre', ventas: 10000 },
    { name: 'Octubre', ventas: 15000 },
  ]);*/
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
    const res = await fetch(route('ventas.getDatos',{...payload}));
    const data = await res.json();
    setLoad(false);
    setDatos(data);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gráficos" />
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
        {/*<div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
            <div className='ml-4 my-3 text-center'>Barras</div>
            <GraficoBarras data={data} ejeX='name' ejeY='ventas' color="#2219cd"/>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
            <div className='ml-4 my-3 text-center'>Tortas</div>
            <GraficoTortas 
              data={data} 
              name='name' 
              valor='ventas'
              colores={['#0088FE', '#00C49F', '#FFBB28', '#FF8042']}/>
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
            <div className='ml-4 my-3 text-center'>Líneas</div>
            <GraficoLineas
              data={data} name='name' valor='ventas'
              color="#8782ca"/>
          </div>*/}
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
              <GraficoBarras data={datos} ejeX='name' ejeY='valor' color="#2219cd"/>
            )}
            {data.tipo == 2 && (
              <GraficoBarras data={datos} ejeX='name' ejeY='valor' color="#524ea3"/>
            )}
            {data.tipo == 3 && (
              <GraficoLineas
                data={datos} name='name' valor='valor'
                color="#8782ca"
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}