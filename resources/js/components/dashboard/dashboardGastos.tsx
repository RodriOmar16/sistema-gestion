import { Loader2 } from "lucide-react";
import GraficoGastos from "../utils/grafico_gasto";
import { convertirNumberPlata } from "@/utils";

interface Props {
  gastos: any[];
  load: boolean;
  cantGastos: number;
  totalGastos: number;
  tema: string | 'dark' | 'light';
}

export default function DashboardGastos({gastos, load, tema, cantGastos, totalGastos }:Props){
  return (
    <div>
      <div className="mx-4">
        { gastos.length === 0 && !load && (
          <div className='h-50 ml-4 my-3 text-center flex justify-center items-center'>
            <span>No hay datos para mostrar</span>
          </div>
        )}
        { load && (
          <div className="flex justify-center items-center my-3 h-50">
            <Loader2 size={20} className="animate-spin mr-2" /> 
            <span>Cargando...</span>
          </div>
        )}

        
        {gastos.length > 0 && !load && (
          <>
            <div className='gap-4 grid grid-cols-12'>
              <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-8 flex items-center overflow-auto rounded-xl h-80 border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
                <GraficoGastos
                  data={gastos}
                  dataKey='total'
                  nameKey='name'
                  altura={350}
                  colores={tema != 'dark'? 
                      ['#0088FE', '#1f629e', '#02111e', '#033c6d', '#555d63'] 
                    : 
                      ['#0c85ef', '#265782', '#0d3557', '#4b6378', '#144f83']
                  }
                />
              </div>
              <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4 flex flex-col justify-center'>
                <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center mb-4 flex flex-col items-center">
                  <h3 className="text-sm text-gray-800 dark:text-white">Cantidad</h3>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-400 flex justify-center items-center h-10">
                    {load ? <Loader2 size={25} className="animate-spin" /> : cantGastos}
                  </p>
                </div>
                <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center flex flex-col items-center">
                  <h3 className="text-sm text-gray-800 dark:text-white">Total</h3>
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 flex justify-center items-center h-10">
                    {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(totalGastos))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}