import { convertirNumberPlata } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface Props{
  data: any[];
  ejeX: string;
  ejeY: string;
  color: string;
  altura: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const punto = payload[0].payload; // el objeto completo de ese dato
    return (
      <div className="rounded-lg shadow-md bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-3">
        <p>Nombre: <strong>{label}</strong></p>
        <p>Cantidad: <strong>{punto.cantidad}</strong></p>
        <p>Ganancia: <strong>{convertirNumberPlata(String(punto.total))}</strong></p>
      </div>
    );
  }
  return null;
};

export default function GraficoRankin({ ejeX, ejeY, data, color, altura}:Props) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart 
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 15, top:10, bottom:10 }}
      >
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2F2F3A', opacity: 0.3 }} />
        <XAxis type="number" />
        <YAxis type="category" dataKey={ejeY} width={150}/>
        <Bar dataKey={ejeX} fill={color}>
          <LabelList 
            dataKey={ejeX} 
            position="center" 
            fill="#000"
            formatter={(label: React.ReactNode) =>
              ejeX === 'cantidad'
                ? label
                : ''
            } 
          />
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}
