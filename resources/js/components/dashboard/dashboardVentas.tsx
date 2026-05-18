import { Loader2 } from "lucide-react";
import GraficoBarras from "../utils/grafico-barras";
import GraficoLineas from "../utils/grafico-lineas";
import { convertirNumberPlata } from "@/utils";

interface Props {
  data: any;
  datos: any[];
  load: boolean;
  cantFinal: number;
  totalFinal: number;
  promedio: number;
  tema: string | 'dark' | 'light';
  modo: boolean;
}

export default function DashboardVentas({ data, datos, load, cantFinal, totalFinal, promedio, tema, modo }:Props){
  return (
    <div className='flex gap-2 grid grid-cols-12'>
      <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-9'>
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
                <GraficoBarras tipo={data.tipo} /*modo={modo}*/ data={datos} ejeX='name' ejeY={/*modo? 'total' :*/ 'cantidad'} color={tema=='dark' ? "#6543af" : "#491aae"}/>
              )}
              {data.tipo == 2 && (
                <GraficoBarras tipo={data.tipo} /*modo={modo}*/ data={datos} ejeX='name' ejeY={/*modo? 'total' :*/ 'cantidad'} color="#4e89a3"/>
              )}
              {data.tipo == 3 && (
                <GraficoLineas
                  data={datos} 
                  tipo={data.tipo} /*modo={modo}*/
                  name='name' 
                  valor={modo? 'total' : 'cantidad'}
                  color={tema=='dark' ? "#82b6ca" : "#1693c5"}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className='col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-3 flex flex-col'>
        <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center">
          <h3 className="text-sm text-gray-800 dark:text-white">Ingresos</h3>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400 text-center flex justify-center items-center h-10">
            {load ? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(totalFinal))}
          </p>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center my-4">
          <h3 className="text-sm text-gray-800 dark:text-white">Ventas</h3>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-400 text-center flex justify-center items-center h-10">
            {load? <Loader2 size={25} className="animate-spin" /> : cantFinal}
          </p>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 border p-3 text-center">
          <h3 className="text-sm text-gray-800 dark:text-white">Promedio</h3>
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 text-center flex justify-center items-center h-10">
            {load? <Loader2 size={25} className="animate-spin" /> : convertirNumberPlata(String(promedio))}
          </p>
        </div>
      </div>
    </div>
  );
}