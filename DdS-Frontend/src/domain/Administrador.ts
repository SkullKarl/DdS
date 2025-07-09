import { Usuario } from './Usuario';

export class Administrador extends Usuario {
  constructor(
    nombre: string,
    correo_electronico: string,
    contraseña: string,
    telefono: string,
    public estado: string
  ) {
    super(nombre, correo_electronico, contraseña, telefono);
  }
}