import { convertirNumberPlata } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

/*const data = [
  { name: 'Enero', ventas: 12000 },
  { name: 'Febrero', ventas: 15000 },
  { name: 'Marzo', ventas: 18000 },
];*/

interface Props{
  tipo: number;
  modo?: boolean;
  data: any[];
  ejeX: string;
  ejeY: string;
  color: string;
}

const CustomTooltip = ({ active, payload, label, tipo }: any) => {
  if (active && payload && payload.length) {
    const punto = payload[0].payload; // el objeto completo de ese dato
    return (
      <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3">
        <p>{tipo==1 ? 'Hora' : 'Día'}: <strong>{label}</strong></p>
        <p>Cantidad: <strong>{punto.cantidad}</strong></p>
        <p>Ganancia: <strong>{convertirNumberPlata(String(punto.total))}</strong></p>
      </div>
    );
  }
  return null;
};

export default function GraficoBarras({tipo, modo, ejeX, ejeY, data, color}:Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ left: modo ? 40 : 0, right: 15 }}
      >
        <XAxis dataKey={ejeX}/>
        <Tooltip content={<CustomTooltip tipo={tipo}/>} cursor={{ fill: '#2F2F3A', opacity: 0.3 }} />
        <YAxis
          tickFormatter={(value: number) => !modo ? String(value) : `$${value.toLocaleString('es-AR')}`}
        />
        <Bar dataKey={ejeY} fill={color}>
          <LabelList
            dataKey={ejeY}
            position="center"
            fill="#000"
            formatter={(label: React.ReactNode) =>
              typeof label === 'number'
                ? label.toLocaleString('es-AR')
                : convertirNumberPlata(String(label))
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
