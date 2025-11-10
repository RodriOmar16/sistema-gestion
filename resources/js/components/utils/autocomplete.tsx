import { useState } from "react";

interface Props {
  opciones: string[];
  value: string;
  setValue: (val: string) => void;
  placeholder?: string;
}

export default function Autocomplete({ opciones, value, setValue, placeholder }: Props) {
  const [filtro, setFiltro] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = e.target.value;
    setValue(texto);
    setFiltro(opciones.filter(op => op.toLowerCase().includes(texto.toLowerCase())));
    setAbierto(true);
  };

  const seleccionar = (opcion: string) => {
    setValue(opcion);
    setFiltro([]);
    setAbierto(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={manejarCambio}
        placeholder={placeholder}
        className="w-full border px-2 py-1 rounded"
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 100)} // para permitir clic
      />
      {abierto && filtro.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow">
          {filtro.map((op, idx) => (
            <li
              key={idx}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => seleccionar(op)}
            >
              {op}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
