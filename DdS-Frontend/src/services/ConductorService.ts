import { supabase } from '../api/supabaseConfig';
import { Conductor } from '../domain/Conductor';

export class ConductorService {
  static async crearConductor(conductor: Conductor) {
    return await supabase
      .from('conductor')
      .insert([{
        nombre: conductor.nombre,
        correo_electronico: conductor.correo_electronico,
        contraseña: conductor.contraseña,
        telefono: conductor.telefono,
        vehiculo: conductor.vehiculo,
        licencia_conducir: conductor.licencia_conducir,
        estado: conductor.estado,
      }]);
  }
}