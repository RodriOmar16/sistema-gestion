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
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const balance = payload.find(p => p.dataKey === "balance")?.value || 0;
  const gastos = payload.find(p => p.dataKey === "gastos")?.value || 0;
  const ventas = payload.find(p => p.dataKey === "ventas")?.value || 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        minWidth: "180px",
      }}
    >
      <p style={{ margin: 0, fontWeight: "bold", color: "#222" }}>{label}</p>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "#4266AE" }}>
        <span>Ventas:</span>
        <strong>{convertirNumberPlata(ventas)}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "#94CBA4" }}>
        <span>Gastos:</span>
        <strong>{convertirNumberPlata(gastos)}</strong>
      </div>

      <hr style={{ margin: "6px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "#9387C0" }}>
        <span>Balance:</span>
        <strong>{convertirNumberPlata(balance)}</strong>
      </div>
    </div>
  );
};

export default function DashboardBalances({balances, load}:Props){
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
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
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
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                <Bar dataKey="ventas" fill='#4266AE' radius={[4, 4, 0, 0]} name="Ventas" />
                <Bar dataKey="gastos" fill="#94CBA4" radius={[4, 4, 0, 0]} name="Gastos" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#9387C0"
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