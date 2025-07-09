export interface Cliente {
  id_cliente: string;
  nombre: string;
  contraseña: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  preferencia_notificacion?: string;
}

export interface ClientProfile {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  preferencia_notificacion: string;
}