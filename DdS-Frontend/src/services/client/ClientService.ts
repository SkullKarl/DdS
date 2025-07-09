import { supabase } from "../../api/supabaseConfig";
import { Cliente, ClientProfile } from "../../domain/Cliente";
import { AuthService } from "../AuthService";

export class ClientService {
  /**
   * Gets the current client's profile information
   * @param clientEmail The email of the currently logged-in client
   * @returns Promise<ClientProfile>
   */
  static async getClientProfile(clientEmail: string): Promise<ClientProfile> {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("nombre, correo, telefono, direccion, preferencia_notificacion")
        .eq("correo", clientEmail)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No se encontró el perfil del cliente");
      }

      return {
        nombre: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        preferencia_notificacion: data.preferencia_notificacion || 'email'
      };
    } catch (error) {
      console.error("Error fetching client profile:", error);
      throw error;
    }
  }

  /**
   * Updates the client's profile information
   * @param clientEmail The email of the client to update
   * @param profileData The updated profile data
   * @returns Promise<void>
   */
  static async updateClientProfile(
    clientEmail: string, 
    profileData: Partial<ClientProfile>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("cliente")
        .update(profileData)
        .eq("correo", clientEmail);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating client profile:", error);
      throw error;
    }
  }

  /**
   * Gets all clients (admin functionality)
   * @returns Promise<Cliente[]>
   */
  static async getAllClients(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  /**
   * Creates a new package for the current client
   * @param packageData The package data to create
   * @returns Promise<void>
   */
  static async createPackage(packageData: {
    fecha_e: string;
    direccion_entrega: string;
    peso: number;
    dimensiones: string;
  }): Promise<void> {
    try {
      const email = await AuthService.getCurrentUserEmail();
      if (!email) {
        throw new Error("No hay usuario autenticado");
      }

      // Get the client's ID
      const { data: client, error: clientError } = await supabase
        .from("cliente")
        .select("id_cliente")
        .eq("correo", email)
        .single();

      if (clientError || !client) {
        throw new Error("No se pudo encontrar el cliente");
      }

      // Create the package without envio (envio will be created later by dispatcher)
      const { error: packageError } = await supabase
        .from("paquete")
        .insert([{
          fecha_e: packageData.fecha_e,
          direccion_entrega: packageData.direccion_entrega,
          estado: "en bodega",
          id_envio: null, // Will be assigned later by dispatcher
          id_cliente: client.id_cliente,
          peso: packageData.peso,
          dimensiones: packageData.dimensiones
        }]);

      if (packageError) {
        throw packageError;
      }
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  }

  /**
   * Gets the current logged-in client's profile information
   * @returns Promise<ClientProfile>
   */
  static async getCurrentClientProfile(): Promise<ClientProfile> {
    try {
      const email = await AuthService.getCurrentUserEmail();
      if (!email) {
        throw new Error("No hay usuario autenticado");
      }

      return await this.getClientProfile(email);
    } catch (error) {
      console.error("Error fetching current client profile:", error);
      throw error;
    }
  }

  /**
   * Gets the current client's basic information (name and email)
   * @returns Promise<{nombre: string, correo: string}>
   */
  static async getCurrentClientInfo(): Promise<{nombre: string, correo: string}> {
    try {
      const email = await AuthService.getCurrentUserEmail();
      if (!email) {
        throw new Error("No hay usuario autenticado");
      }

      const { data, error } = await supabase
        .from("cliente")
        .select("nombre, correo")
        .eq("correo", email)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No se encontró el cliente");
      }

      return {
        nombre: data.nombre || '',
        correo: data.correo || ''
      };
    } catch (error) {
      console.error("Error fetching current client info:", error);
      throw error;
    }
  }

  /**
   * Gets all packages for the current logged-in client
   * @returns Promise<Package[]>
   */
  static async getCurrentClientPackages(): Promise<any[]> {
    try {
      const email = await AuthService.getCurrentUserEmail();
      if (!email) {
        throw new Error("No hay usuario autenticado");
      }

      // Get the client's ID
      const { data: client, error: clientError } = await supabase
        .from("cliente")
        .select("id_cliente")
        .eq("correo", email)
        .single();

      if (clientError || !client) {
        throw new Error("No se pudo encontrar el cliente");
      }

      // Get all packages for this client
      const { data: packages, error: packagesError } = await supabase
        .from("paquete")
        .select("id_paquete, fecha_e, direccion_entrega, estado, peso, dimensiones")
        .eq("id_cliente", client.id_cliente)
        .order("fecha_e", { ascending: false }); // Order by delivery date

      if (packagesError) {
        throw packagesError;
      }

      return packages || [];
    } catch (error) {
      console.error("Error fetching client packages:", error);
      throw error;
    }
  }
}
