export interface Package {
  id_paquete: number;
  fecha_e: string;
  direccion_entrega: string;
  estado: string;
  id_envio: number;
  id_cliente: number;
  peso: number;
  dimensiones: string;
  despachador_nombre?: string;
  despachador_id?: number;
}