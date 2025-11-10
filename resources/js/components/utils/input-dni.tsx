import { Input } from "../ui/input";
import { formatearNro } from "@/utils";

interface Props {
  data: string;
  placeholder?: string;
  setData: (data: string) => void;
  disabled?: boolean
}

export default function InputDni({ data, setData, placeholder, disabled=false }: Props) {
  return (
    <Input
      disabled={disabled}
      className="text-right"
      value={formatearNro(data)}
      onChange={(e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
        setData(soloNumeros);
      }}
      placeholder={placeholder}
      maxLength={11} // 8 dígitos + 2 puntos + margen
      inputMode="numeric"
    />
  );
}
