import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/*const data = [
  { name: 'Enero', ventas: 12000 },
  { name: 'Febrero', ventas: 15000 },
  { name: 'Marzo', ventas: 18000 },
];*/

interface Props{
  data: any[];
  ejeX: string;
  ejeY: string;
  color: string;
}

export default function GraficoBarras({ejeX, ejeY, data, color}:Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={ejeX} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={ejeY} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}
