import { Input } from "../ui/input";

interface Props {
  data:string;
  placeholder: string | undefined | '';
  setData: (data:string) => void;
}

export default function InputCuil({data, setData, placeholder}:Props){
  const formatearCuit = (valor: string): string => {
    const limpio = valor.replace(/\D/g, '');

    if (limpio.length !== 11) return valor;
    return limpio.replace(/^(\d{2})(\d{8})(\d{1})$/, '$1-$2-$3');
  };

  return (
    <Input
      className="text-right"
      value={formatearCuit(String(data))}
      onChange={(e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 11);
        setData(soloNumeros);
      }}
      placeholder={placeholder}
      maxLength={14}
      inputMode="numeric"
    />
  );
}