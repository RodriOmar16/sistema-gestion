import { convertirNumberPlata } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/*const data = [
  { name: 'Enero', ventas: 12000 },
  { name: 'Febrero', ventas: 15000 },
  { name: 'Marzo', ventas: 18000 },
];*/

interface Props{
  tipo: number;
  modo: boolean;
  data: any[];
  ejeX: string;
  ejeY: string;
  color: string;
}

const CustomTooltip = ({ active, payload, label, tipo }: any) => {
  if (active && payload && payload.length) {
    const punto = payload[0].payload; // el objeto completo de ese dato
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
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
      <BarChart data={data}
        margin={{ left: modo ? 40 : 0 }}
      >
        <XAxis dataKey={ejeX} />
        <Tooltip content={<CustomTooltip tipo={tipo}/>}/>
        <YAxis
          tickFormatter={(value: number) => !modo ? String(value) : `$${value.toLocaleString('es-AR')}`}
        />

        <Bar dataKey={ejeY} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}
