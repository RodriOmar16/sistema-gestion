import { Input } from "../ui/input";
import { formatearNro } from "@/utils";

interface Props {
  data: string;
  placeholder?: string;
  setData: (data: string) => void;
  disabled?: boolean;
  onChange?: () => void;
}

export default function InputDni({ data, setData, placeholder, disabled=false, onChange }: Props) {
  return (
    <Input
      disabled={disabled}
      className="text-right"
      value={formatearNro(data)}
      onChange={(e) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
        setData(soloNumeros);
      }}      
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange?.();
        }
        if (e.key === "Tab" && data.length === 8) {
          onChange?.();
        }
      }}
      placeholder={placeholder}
      maxLength={11} // 8 dígitos + 2 puntos + margen
      inputMode="numeric"
    />
  );
}
