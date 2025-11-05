import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import GraficoBarras from '@/components/utils/grafico-barras';
import GraficoTortas from '@/components/utils/grafico-tortas';
import GraficoLineas from '@/components/utils/grafico-lineas';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Gráficos', href: '', } ];

interface PropsMenu{
  set: (ob:string) => void;
  tipoGrafico: string;
}


export default function Graficos(){
  //data  
  const [data, setData] = useState<any[]>([
    { name: 'Enero', ventas: 12000 },
    { name: 'Febrero', ventas: 9000 },
    { name: 'Marzo', ventas: 18000 },
    { name: 'Mayo', ventas: 20000 },
    { name: 'Junio', ventas: 11000 },
    { name: 'Julio', ventas: 13500 },
    { name: 'Agosto', ventas: 9000 },
    { name: 'Septiembre', ventas: 10000 },
    { name: 'Octubre', ventas: 15000 },
  ]);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Productos" />
      <div className="grid grid-cols-12 gap-2 h-full overflow-x-auto rounded-xl p-4">
        <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 overflow-auto rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <div className='ml-4 my-3 text-center'>Barras</div>
          <GraficoBarras data={data} ejeX='name' ejeY='ventas'/>
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
            color="#82ca9d"/>
        </div>
      </div>
    </AppLayout>
  );
}