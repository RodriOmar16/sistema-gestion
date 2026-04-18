import { convertirNumberPlata } from '@/utils';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: any[];
  dataKey: string;   // ej: "total"
  nameKey: string;   // ej: "name"
  altura?: number;
  colores: string[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const punto = payload[0].payload;
    return (
      <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3">
        <p>Categoría: <strong>{punto.name}</strong></p>
        <p>Cantidad: <strong>{punto.cantidad}</strong></p>
        <p>Ganancia: <strong>{convertirNumberPlata(String(punto.total))}</strong></p>
      </div>
    );
  }
  return null;
};

export default function GraficoGastos({ data, dataKey, nameKey, altura, colores}: Props) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={({ name, value }) =>
            `${name}: ${convertirNumberPlata(String(value))}`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
