import { Paquete } from './Paquete';
import { Ruta } from './Ruta';

export class Envio {
  constructor(
    public ubicacion_actual: string,
    public lista_paquetes: Paquete[],
    public paquetes_entregados: Paquete[],
    public ruta: Ruta
  ) {}
}