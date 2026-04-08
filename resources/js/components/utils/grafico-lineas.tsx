import { convertirNumberPlata } from '@/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/*const data = [
  { fecha: '12/03', ticket: 18000 },
  { fecha: '13/03', ticket: 15000 },
  { fecha: '14/03', ticket: 12000 },
];*/
interface Props{
  tipo: number;
  modo: boolean;
  data: any[];
  name: string;
  valor: string;
  color: string;
}

const CustomTooltip = ({ active, payload, label, tipo }: any) => {
  if (active && payload && payload.length) {
    const punto = payload[0].payload; // el objeto completo de ese dato
    return (
      <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3">
        <p>Mes: <strong>{label}</strong></p>
        <p>Cantidad: <strong>{punto.cantidad}</strong></p>
        <p>Ganancia: <strong>{convertirNumberPlata(String(punto.total))}</strong></p>
      </div>
    );
  }
  return null;
};

export default function GraficoLineas({tipo, modo, data, name, valor, color}:Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}
        margin={{ left: modo ? 50 : 0, top: 10 }}
      >
        <XAxis dataKey={name} />
        <YAxis 
          tickFormatter={(value: number) => !modo ? String(value) : `$${value.toLocaleString('es-AR')}`}
        />
        <Tooltip content={<CustomTooltip tipo={tipo}/>} cursor={{ fill: '#2F2F3A', opacity: 0.3 }}/>
        <Line type="monotone" dataKey={valor} stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  );
}
