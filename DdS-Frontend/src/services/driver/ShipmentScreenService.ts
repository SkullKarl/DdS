import { supabase } from '../../api/supabaseConfig';

export class DriverService {
  /**
   * Gets the driver ID for the currently authenticated user
   * @returns The driver ID or null if not found
   */
  static async getCurrentDriverId(): Promise<number | null> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No se pudo obtener información del usuario actual');
      }
      
      // Find the driver record associated with this user's email
      const { data: driverData, error: driverError } = await supabase
        .from('conductor')
        .select('id_conductor')
        .eq('correo', user.email)
        .single();
      
      if (driverError || !driverData) {
        throw new Error('No se encontró el conductor asociado a este usuario');
      }
      
      return driverData.id_conductor;
    } catch (error: any) {
      console.error('Error getting current driver ID:', error);
      throw error;
    }
  }
}