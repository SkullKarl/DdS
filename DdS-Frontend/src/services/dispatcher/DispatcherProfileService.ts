import { supabase } from '../../api/supabaseConfig';
import { DispatcherProfile } from '../../domain/DispatcherProfile';

export class DispatcherProfileService {
  /**
   * Fetches the profile data for the currently authenticated dispatcher
   * @returns Dispatcher profile data
   */
  static async getCurrentProfile(): Promise<DispatcherProfile> {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error('No se encontró usuario autenticado');
      }
      
      // Get the dispatcher data from the database
      const { data, error } = await supabase
        .from('despachador')
        .select('*')
        .eq('correo', user.email)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No se encontraron datos del despachador');
      }
      
      // Log the data to debug
      console.log('Despachador data keys:', Object.keys(data));
      
      // Use id_despachador instead of id
      const despachadorId = data.id_despachador;
      
      if (!despachadorId) {
        console.error('ID de despachador no encontrado en:', data);
        throw new Error('ID de despachador no encontrado');
      }
      
      console.log('Using despachador ID:', despachadorId);
      
      // Get count of assignments
      const { data: asignaciones, error: countError } = await supabase
        .from('asignacion')
        .select('id_envio')
        .eq('id_despachador', despachadorId);
        
      if (countError) {
        console.error('Error al obtener asignaciones:', countError);
      }
      
      // Calculate count manually from the returned array
      const paquetesCount = asignaciones ? asignaciones.length : 0;
      console.log('Conteo de paquetes calculado:', paquetesCount);
      
      return {
        nombre: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        departamento: data.departamento || '',
        foto_url: data.foto_url || null,
        paquetes_asignados: paquetesCount,
      };
    } catch (error) {
      console.error('Error fetching dispatcher profile data:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}