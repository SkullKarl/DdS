export interface DriverProfile {
  nombre: string;
  correo: string;
  telefono: string;
  estado: string;
  licencencia: string;
  vehiculo: string;
  foto_url: string | null;
  entregas_completadas: number;
  valoracion: number;
}