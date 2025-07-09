export interface RegistrationData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
}

export interface DriverRegistrationData extends RegistrationData {
  estado: string;
  licencia: string;
  vehiculo: string;
}

export interface DispatcherRegistrationData extends RegistrationData {
  // Additional dispatcher fields can be added here if needed
}

export interface ClientRegistrationData extends RegistrationData {
  direccion: string;
  preferencia_notificacion?: string;
}

export interface UserRole {
  role: 'dispatcher' | 'driver' | 'client' | null;
  userData: any;
}