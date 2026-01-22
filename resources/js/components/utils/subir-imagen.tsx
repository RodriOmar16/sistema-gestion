import { Producto } from "@/types/typeCrud";
import { Input } from "../ui/input";

interface Props{
  set: (s:any) => void;
};

export default function SubirImagen({set}:Props){
  return (
    <div>
      <Input
        type="file" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            set(e.target.files[0]);
          }
        }} 
      />

    </div>
  );
}