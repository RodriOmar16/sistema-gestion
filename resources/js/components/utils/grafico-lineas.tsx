import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/*const data = [
  { fecha: '12/03', ticket: 18000 },
  { fecha: '13/03', ticket: 15000 },
  { fecha: '14/03', ticket: 12000 },
];*/
interface Props{
  data: any[];
  name: string;
  valor: string;
  color: string;
}

export default function GraficoLineas({data, name, valor, color}:Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey={name} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={valor} stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  );
}
