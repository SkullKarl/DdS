import { supabase } from '../../api/supabaseConfig';
import { Package } from '../../domain/Package';
import { Driver } from '../../domain/Driver';

export class DispatcherService {
  /**
   * Fetches all packages from the database
   * @returns Array of packages
   */
  static async getPackages(): Promise<Package[]> {
    try {
      const { data, error } = await supabase
        .from('paquete')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  /**
   * Fetches all available drivers
   * @returns Array of drivers
   */
  static async getDrivers(): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('conductor')
        .select('id_conductor, nombre');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  /**
   * Gets the current dispatcher ID based on the authenticated user
   * @returns Dispatcher ID
   */
  static async getCurrentDispatcherId(): Promise<number> {
    try {
      // Get current user info
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No se ha encontrado información del usuario');
      }
      
      // Find the dispatcher ID from the despachador table using the email
      const { data, error } = await supabase
        .from('despachador')
        .select('id_despachador')
        .eq('correo', user.email)
        .single();
      
      if (error || !data) {
        throw new Error('No se encontró el despachador asociado a este usuario');
      }
      
      return data.id_despachador;
    } catch (error) {
      console.error('Error getting dispatcher ID:', error);
      throw error;
    }
  }

  /**
   * Assigns a package to a driver
   * @param packageData The package to assign
   * @param driverId The ID of the driver to assign the package to
   * @returns Success status
   */
  static async assignPackageToDriver(packageData: Package, driverId: number): Promise<void> {
    try {
      // Get the current dispatcher ID
      const dispatcherId = await this.getCurrentDispatcherId();
      
      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('asignacion')
        .insert({
          id_despachador: dispatcherId,
          id_conductor: driverId,
          id_envio: packageData.id_envio
        });
      
      if (assignmentError) {
        throw assignmentError;
      }
      
      // Update package status
      const { error: updateError } = await supabase
        .from('paquete')
        .update({ estado: 'asignado' })
        .eq('id_paquete', packageData.id_paquete);
      
      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error('Error assigning package:', error);
      throw error;
    }
  }
}