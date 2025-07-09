import { supabase } from "../../api/supabaseConfig";
import { Package } from "../../domain/Package";
import { Driver } from "../../domain/Driver";
import { RutaService } from "../RutaService";

export class DispatcherService {
  /**
   * Fetches all packages from the database
   * @returns Array of packages
   */
  static async getPackages(): Promise<Package[]> {
    try {
      const { data, error } = await supabase.from("paquete").select("*");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching packages:", error);
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
        .from("conductor")
        .select("id_conductor, nombre");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching drivers:", error);
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No se ha encontrado información del usuario");
      }

      // Find the dispatcher ID from the despachador table using the email
      const { data, error } = await supabase
        .from("despachador")
        .select("id_despachador")
        .eq("correo", user.email)
        .single();

      if (error || !data) {
        throw new Error(
          "No se encontró el despachador asociado a este usuario"
        );
      }

      return data.id_despachador;
    } catch (error) {
      console.error("Error getting dispatcher ID:", error);
      throw error;
    }
  }

  /**
   * Assigns a package to a driver
   * @param packageData The package to assign
   * @param driverId The ID of the driver to assign the package to
   * @returns Success status
   */
  static async assignPackageToDriver(
    packageData: Package,
    driverId: string
  ): Promise<void> {
    try {
      const dispatcherId = await this.getCurrentDispatcherId();

      // Verificar si ya existe la asignación
      const { data: existing, error: selectError } = await supabase
        .from("asignacion")
        .select("*")
        .eq("id_despachador", dispatcherId)
        .eq("id_conductor", driverId)
        .eq("id_envio", packageData.id_envio)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw selectError;
      }

      if (!existing) {
        // Solo insertar si no existe
        const { error: assignmentError } = await supabase
          .from("asignacion")
          .insert({
            id_despachador: dispatcherId,
            id_conductor: driverId,
            id_envio: packageData.id_envio,
          });
        if (assignmentError) throw assignmentError;
      }

      // Actualizar paquete
      const { error: updateError } = await supabase
        .from("paquete")
        .update({ estado: "asignado", id_envio: packageData.id_envio })
        .eq("id_paquete", packageData.id_paquete);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error assigning package:", error);
      throw error;
    }
  }

  static async getOrCreateEnvioForDriver(driverId: string, paquete: Package) {
    // 1. Buscar asignaciones del conductor
    const { data: asignaciones, error: asignacionError } = await supabase
      .from("asignacion")
      .select("id_envio")
      .eq("id_conductor", driverId);

    if (asignacionError) throw asignacionError;

    let envioActivo = null;

    if (asignaciones && asignaciones.length > 0) {
      const envioIds = asignaciones.map((a) => a.id_envio);

      const { data: envios, error: envioError } = await supabase
        .from("envio")
        .select("*")
        .in("id_envio", envioIds)
        .limit(1);

      if (envioError) throw envioError;
      if (envios && envios.length > 0) {
        envioActivo = envios[0];
      }
    }

    if (envioActivo) {
      await RutaService.addDestinoToRuta(
        envioActivo.id_ruta,
        paquete.direccion_entrega
      );
      return envioActivo;
    }

    // Si no hay, crear uno nuevo
    const id_ruta = await RutaService.createRutaForPackage(paquete);
    const { data: newEnvio, error: createError } = await supabase
      .from("envio")
      .insert({
        // Puedes agregar más campos si tu modelo lo requiere
        paquetes_totales: 1,
        id_ruta: id_ruta,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newEnvio;
  }
}
