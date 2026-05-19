import { convertirNumberPlata } from "@/utils";
import { Loader2 } from "lucide-react";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LabelList,
} from "recharts";

interface Props {
  balances: any[];
  load:     boolean;
  tema:     string | 'dark' | 'light';
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: any[];
  label?:   string;
  tema:     string | 'dark' | 'light';
}

const CustomTooltip = ({ active, payload, label, tema }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const balance = payload.find(p => p.dataKey === "balance")?.value || 0;
  const gastos = payload.find(p => p.dataKey === "gastos")?.value || 0;
  const ventas = payload.find(p => p.dataKey === "ventas")?.value || 0;

  return (
    <div
      className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3"
    >
      <p style={{ margin: 0, fontWeight: "bold", color: tema!='dark' ? "#222" : '#fff' }}>{label}</p>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: tema != 'dark' ? '#5FC4E5' : '#464798' }}>
        <span>Ventas:</span>
        <strong>{convertirNumberPlata(ventas)}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: tema != 'dark' ? "#94CBA4" : '#5FC4E5' }}>
        <span>Gastos:</span>
        <strong>{convertirNumberPlata(gastos)}</strong>
      </div>

      <hr style={{ margin: "6px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: tema != 'dark' ? "#9387C0" : '#94CBA4' }}>
        <span>Balance:</span>
        <strong>{convertirNumberPlata(balance)}</strong>
      </div>
    </div>
  );
};

export default function DashboardBalances({balances, load, tema}:Props){
  const dataConBalance = balances.map(d => ({
    ...d,
    balance: d.ventas - d.gastos
  }));

  return (
    <div>
      <div className="mx-4 p-4">
        { balances.length === 0 && !load && (
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

        {balances.length > 0 && !load && (
          <>
             <div className="p-4">
              <ComposedChart width={1000} height={400} data={dataConBalance}>
                <XAxis dataKey="periodo" tick={{ fill: "#555" }} />
                {/*<YAxis tickFormatter={(v) => v.toLocaleString('es-AR')} />*/}
                <YAxis
                  domain={[0, 'dataMax']}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('es-AR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(v)
                  }
                  tick={{ fill: '#444', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip tema={tema}/>} />
                <Legend verticalAlign="top" height={36} />

                <Bar dataKey="ventas" fill={tema != 'dark' ? '#5FC4E5' : '#464798'} radius={[4, 4, 0, 0]} name="Ventas" />
                <Bar dataKey="gastos" fill={tema != 'dark' ? "#94CBA4" : '#5FC4E5'} radius={[4, 4, 0, 0]} name="Gastos" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={tema != 'dark' ? "#9387C0" : '#94CBA4'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Balance"
                />
              </ComposedChart>

             </div>
          </>
        )}
      </div>
    </div>
  );
}