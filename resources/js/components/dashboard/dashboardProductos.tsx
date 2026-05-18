import { Loader2 } from "lucide-react";
import GraficoRankin from "../utils/grafico-ranking";

interface Props {
  load: boolean;
  datosProd: any[];
  modo: boolean;
  datosProdTotal: any[];
}

export default function DashboardProductos({ load, datosProd, modo, datosProdTotal }:Props){
  return (
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
                    <div className='m-2 flex gap-4 grid grid-cols-12'>
                      {/* Gráficos */}
                      <div className="overflow-auto col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-7">
                        <GraficoRankin data={modo? datosProdTotal : datosProd} ejeX={modo? 'total' : 'cantidad'} ejeY='name' color="#19cd9d" altura={390}/>
                      </div>
                      {/* Tablas */}
                      <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-5 pt-4 pr-4">
                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                          <thead>
                            <tr className="bg-gray-200 dark:bg-gray-800 text-sm">
                              <th className="border px-2 py-1">Nombre</th>
                              <th className="border px-2 py-1">Cantidad</th>
                              <th className="border px-2 py-1">Precio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(modo? datosProdTotal : datosProd).map((item:any, i) => (
                              <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-900 text-sm">
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
  );
}