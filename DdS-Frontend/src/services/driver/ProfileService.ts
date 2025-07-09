import { supabase } from '../../api/supabaseConfig';
import { DriverProfile } from '../../domain/DriverProfile';

export class ProfileService {
  /**
   * Fetches the profile data for the currently authenticated driver
   * @returns Driver profile data
   */
  static async getCurrentProfile(): Promise<DriverProfile> {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error('No se encontró usuario autenticado');
      }
      
      // Get the driver data from the database
      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .eq('correo', user.email)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No se encontraron datos del conductor');
      }
      
      return {
        nombre: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        estado: data.estado || '',
        licencencia: data.licencencia || '',
        vehiculo: data.vehiculo || '',
        foto_url: data.foto_url || null,
        entregas_completadas: data.entregas_completadas || 0,
        valoracion: data.valoracion || 0,
      };
    } catch (error) {
      console.error('Error fetching profile data:', error);
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