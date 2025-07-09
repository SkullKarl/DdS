import { supabase } from "../api/supabaseConfig";
import {
  RegistrationData,
  DriverRegistrationData,
  DispatcherRegistrationData,
  UserRole,
} from "../domain/Auth";

export * from "../domain/Auth";

export class AuthService {
  /**
   * Validates an email address format using a more reliable regex pattern
   * @param email Email address to validate
   * @returns True if email is valid, false otherwise
   */
  static validateEmail(email: string): boolean {
    if (!email || email.trim() === "") return false;

    // More reliable email regex that handles more valid email formats
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Logs in a user with email and password
   * @param email User email
   * @param password User password
   * @returns User role and data
   */
  static async login(email: string, password: string): Promise<UserRole> {
    try {
      // Authenticate with Supabase
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if the user is a dispatcher
      const { data: dispatcher, error: dispatcherError } = await supabase
        .from("despachador")
        .select("*")
        .eq("correo", email)
        .single();

      if (dispatcher) {
        return {
          role: "dispatcher",
          userData: dispatcher,
        };
      }

      // Check if the user is a driver
      const { data: driver, error: driverError } = await supabase
        .from("conductor")
        .select("*")
        .eq("correo", email)
        .single();

      if (driver) {
        return {
          role: "driver",
          userData: driver,
        };
      }

      // Check if the user is a client
      const { data: client, error: clientError } = await supabase
        .from("cliente")
        .select("*")
        .eq("correo", email)
        .single();

      if (client) {
        return {
          role: "client",
          userData: client,
        };
      }

      // No role found
      throw new Error("No se encontró el usuario en ninguna tabla de roles.");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Registers a new user (base method)
   * @param email User email
   * @param password User password
   * @returns Data from Supabase auth signup
   */
  private static async registerUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Registers a new driver
   * @param driverData Driver registration data
   */
  static async registerDriver(
    driverData: DriverRegistrationData
  ): Promise<void> {
    try {
      // Register the user in auth
      await this.registerUser(driverData.email, driverData.password);

      // Insert driver data into the conductor table
      const { error: dbError } = await supabase.from("conductor").insert([
        {
          nombre: driverData.nombre,
          correo: driverData.email,
          contraseña: driverData.password,
          telefono: driverData.telefono,
          estado: driverData.estado,
          licencencia: driverData.licencia,
          vehiculo: driverData.vehiculo,
        },
      ]);

      if (dbError) {
        throw dbError;
      }
    } catch (error) {
      console.error("Error registering driver:", error);
      throw error;
    }
  }

  /**
   * Registers a new dispatcher
   * @param dispatcherData Dispatcher registration data
   */
  static async registerDispatcher(
    dispatcherData: DispatcherRegistrationData
  ): Promise<void> {
    try {
      // Register the user in auth
      await this.registerUser(dispatcherData.email, dispatcherData.password);

      // Insert dispatcher data into the despachador table
      const { error: dbError } = await supabase.from("despachador").insert([
        {
          nombre: dispatcherData.nombre,
          correo: dispatcherData.email,
          contraseña: dispatcherData.password,
          telefono: dispatcherData.telefono,
        },
      ]);

      if (dbError) {
        throw dbError;
      }
    } catch (error) {
      console.error("Error registering dispatcher:", error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  /**
   * Gets the current logged-in user's email
   * @returns Promise<string | null>
   */
  static async getCurrentUserEmail(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.email || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}
