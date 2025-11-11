export function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function ordenarPorTexto<T>(array: T[], campo: keyof T): T[] {
  return [...array].sort((a, b) => {
    const textoA = String(a[campo]).toLowerCase().trim();
    const textoB = String(b[campo]).toLowerCase().trim();
    return textoA.localeCompare(textoB);
  });
}

export function resetLocalStorage(){
  localStorage.removeItem('menu');
  localStorage.removeItem('menu-data');
}

export function formatearCuilCompleto(cuil: number): string {
  const limpio = cuil.toString().padStart(11, '0'); // asegura 11 dígitos

  if (limpio.length !== 11) return limpio;

  const parte1 = limpio.slice(0, 2);
  const parte2 = limpio.slice(2, 10);
  const parte3 = limpio.slice(10);

  return `${parte1}-${parte2}-${parte3}`; //dd-dddddddd-d
}

export function convertirFechaBarrasGuiones(fecha:string ){
  return fecha.split('/').reverse().join('-');
}
export function convertirFechaGuionesBarras(fecha:string ){
  return fecha.split('-').reverse().join('/');
}

export function convertirNumberPlata(monto:string){
  const amount = parseFloat(monto)
  // Format the amount as a dollar amount
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

  return formatted;
}

export function formatearNro(valor: string){
  const limpio = valor.replace(/\D/g, '');
  return limpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
export function formatearNroCompleto(nro: string): string {
  const limpio = nro.replace(/\D/g, '');
  let nroInverso = limpio.split('').reverse();

  let cad = '';
  for(let i=0;i<nroInverso.length;i++){
    if(i>0 && i%3==0){
      cad += '.';
    }
    cad += nroInverso[i];
  }

  return cad.split('').reverse().join(''); 
}

export function redondear(nro:number, precision:number){
  const redondeado = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(nro); // "123,46"
  return redondeado;
} 

