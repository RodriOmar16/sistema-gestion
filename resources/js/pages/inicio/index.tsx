import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
//import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Carousel from '@/components/carousel';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { convertirFechaBarrasGuiones, convertirFechaGuionesBarras, convertirNumberPlata, formatDateTime } from '@/utils';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [ { title: 'Inicio', href: /*dashboard().url*/'/inicio' } ];

interface PageProps extends SharedData {
  carouselImages: string[];
}

interface Indicador {total: number, cantidad: number};
const indicadorVacio = {total: 0, cantidad: 0};

interface tipoVentas{
  fecha_grabacion: string;
  cliente_nombre:  string;
  total:           number;
  anulada:         number;
}

interface tipoGastos{
  fecha:                  string;
  categoria_gasto_nombre: string;
  forma_pago_nombre:      string;
  monto:                  number;
  inhabilitado:           number;
}

export default function Inicio() {
  const { auth } = usePage().props;
  const [load, setLoad] = useState(false);
  const [indicadorVentas, setIndicadorVentas] = useState<Indicador>(indicadorVacio);
  const [indicadorGastos, setIndicadorGastos] = useState<Indicador>(indicadorVacio);
  const [balance, setBalance] = useState(0);
  const [ventas, setVentas] = useState<tipoVentas[]>([]);
  const [gastos, setGastos] = useState<tipoGastos[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoad(true);
      const [res] = await Promise.all([
        fetch(route('general.getDatos'))
      ]);
      setLoad(false);

      const data = await res.json();
      console.log("data: ", data);

      setVentas(data.ventas);
      setGastos(data.gastos);
      setIndicadorVentas(data.indicador_ventas);
      setIndicadorGastos(data.indicador_gastos);
      setBalance(data.balance);
    };
    
    cargarDatos();
    
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inicio" />
      {/*<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row gap-8">

            <div className="w-full lg:w-3/4">
              {Array.isArray(carouselImages) && carouselImages.length > 0 && (
                <Carousel
                  images={carouselImages}
                  autoPlay
                  interval={4000}
                  pauseOnHover
                />
              )}
            </div>

            <div className="flex flex-col justify-center w-full lg:w-1/4 textcenter lg:text-left">
              <h1 className="text-3xl font-semibold mb-3 dark:text-white">
              Bienvenido/a a SGVSA
              </h1>
              <p className="text-gray-700 dark:text-gray-300">
                Este es un sistema versátil, te permite hacer control de Stock, 
                Ventas y Arqueos de caja.
              </p>
            </div>
          </main>
          </div>
      </div>*/}
      {/*<div className="grid grid-cols-12 gap-2 rounded-xl p-4">
        <div className='pl-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 text-lg'>
          Bienvenido/a, <span className='font-bold'> {auth?.user?.name }</span>
        </div>
        <div className='pl-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex justify-center'>
          Resumen del último mes
        </div>
        <div className='mt-4 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 flex justify-center'>
          <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center w-50">
            <h3 className="text-sm text-gray-800 dark:text-white">Ventas</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 text-center flex justify-center items-center h-10">
              {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(indicadorVentas.total))}
            </p>
            <h3 className="text-sm text-gray-800 dark:text-white">Cantidad</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 text-center flex justify-center items-center h-10">
              {load ? <Loader2 size={25} className="animate-spin" /> : indicadorVentas.cantidad}
            </p>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center m-4 w-50">
            <h3 className="text-sm text-gray-800 dark:text-white">Gastos</h3>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400 text-center flex justify-center items-center h-10">
              {load? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(indicadorGastos.total))}
            </p>
            <h3 className="text-sm text-gray-800 dark:text-white">Cantidad</h3>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center flex justify-center items-center h-10">
              {load ? <Loader2 size={25} className="animate-spin" /> : indicadorGastos.cantidad}
            </p>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center w-50">
            <h3 className="text-sm text-gray-800 dark:text-white">Balance</h3>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 text-center flex justify-center items-center h-10">
              {load? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(balance))}
            </p>
          </div>
        </div>
        <div className='mt-2 col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12'>
          <div className="grid grid-cols-12 gap-2 rounded-xl p-4">
            <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6'>
              Últimas ventas
            </div>
            <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-6'>
              Últimos gastos
            </div>
          </div>
        </div>
      </div>*/}
      <div className="grid grid-cols-12 gap-4 rounded-xl p-6">
        <div className="col-span-12 text-lg pl-2">
          Bienvenido/a, <span className="font-bold">{auth?.user?.name}</span>
        </div>

        <div className="col-span-12 text-center text-gray-600 dark:text-gray-300">
          Resumen del último mes
        </div>

        <div className="col-span-12 flex flex-wrap justify-center gap-4">
          <div className="bg-gray-200 dark:bg-gray-800 border rounded-lg p-2 text-center w-64 shadow-sm">
            <h3 className="text-sm text-gray-800 dark:text-white">Ventas</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 h-7 flex items-center justify-center">
              {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(indicadorVentas.total))}
            </p>
            <h3 className="text-sm text-gray-800 dark:text-white">Cantidad</h3>
            <p className="text-xl font-bold text-green-700 dark:text-green-400 h-7 flex items-center justify-center">
              {load ? <Loader2 size={25} className="animate-spin" /> : indicadorVentas.cantidad}
            </p>
          </div>

          <div className="bg-gray-200 dark:bg-gray-800 border rounded-lg p-2 text-center w-64 shadow-sm">
            <h3 className="text-sm text-gray-800 dark:text-white">Gastos</h3>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400 h-7 flex items-center justify-center">
              {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(indicadorGastos.total))}
            </p>
            <h3 className="text-sm text-gray-800 dark:text-white">Cantidad</h3>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400 h-7 flex items-center justify-center">
              {load ? <Loader2 size={25} className="animate-spin" /> : indicadorGastos.cantidad}
            </p>
          </div>

          <div className="bg-gray-200 dark:bg-gray-800 border rounded-lg p-4 text-center w-64 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm text-gray-800 dark:text-white">Balance</h3>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 h-7 ">
              {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(balance))}
            </p>
          </div>
        </div>
        <div className="col-span-12 my-2">
          <hr />
        </div>
        <div className="col-span-12 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Últimas ventas</h4>
              <button
                onClick={() => router.visit('/ventas')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver más
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border overflow-x-auto max-h-70 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {ventas.map((v, i) => (
                    <tr key={i} className="border-t dark:border-gray-700">
                      <td className="px-4 py-2">{formatDateTime(v.fecha_grabacion)}</td>
                      <td className="px-4 py-2">{v.cliente_nombre}</td>
                      <td className="px-4 py-2 text-right">{convertirNumberPlata(String(v.total))}</td>
                      <td className="px-4 py-2 text-center">
                        {v.anulada ? (
                          <span className="text-red-600 font-semibold">Anulada</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Aprobada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {ventas.length == 0 && (
                    <tr className="border-t dark:border-gray-700">
                      <td className="px-4 py-2 text-center" colSpan={4}>
                        Cargando...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Últimos gastos</h4>
              <button
                onClick={() => router.visit('/gastos')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver más
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border overflow-x-auto max-h-70 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Categoría</th>
                    <th className="px-4 py-2 text-left">F. de pago</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                    <th className="px-4 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {gastos.map((g, i) => (
                    <tr key={i} className="border-t dark:border-gray-700">
                      <td className="px-4 py-2">{convertirFechaGuionesBarras(g.fecha)}</td>
                      <td className="px-4 py-2">{g.categoria_gasto_nombre}</td>
                      <td className="px-4 py-2">{g.forma_pago_nombre}</td>
                      <td className="px-4 py-2 text-right">{convertirNumberPlata(String(g.monto))}</td>
                      <td className="px-4 py-2 text-center">
                        {g.inhabilitado ? (
                          <span className="text-red-600 font-semibold">Inactivo</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Activo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {gastos.length == 0 && (
                    <tr className="border-t dark:border-gray-700">
                      <td className="px-4 py-2 text-center" colSpan={5}>
                        Cargando...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}
