import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/*const data = [
  { name: 'Efectivo', value: 800000 },
  { name: 'MP', value: 500000 },
  { name: 'PayWay', value: 300000 },
  { name: 'Galicia', value: 181042 },
];*/
interface Props{
  data: any[];
  name: string;
  valor: string;
  colores: string[];
}
//const colores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function GraficoTortas({data, name, valor, colores}:Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey={valor} nameKey={name} outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
