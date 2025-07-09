// @ts-nocheck

import { supabase } from "../api/supabaseConfig";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Package } from "../domain/Package";
import { EnvioStateService } from "./EnvioStateService";
export * from "../domain/Package";

export class ShipmentService {
  /**
   * Fetches all packages assigned to a specific driver
   * @param driverId The ID of the driver
   * @returns Array of Package objects
   */
  static async getDriverPackages(driverId: number): Promise<Package[]> {
    try {
      // First, get all assignments for this driver
      const { data: assignments, error: assignmentError } = await supabase
        .from("asignacion")
        .select(
          `
          id_envio,
          despachador:id_despachador(id_despachador, nombre)
        `
        )
        .eq("id_conductor", driverId);

      if (assignmentError) {
        throw assignmentError;
      }

      if (!assignments || assignments.length === 0) {
        return [];
      }

      // Get the list of shipment IDs assigned to this driver
      const envioIds = assignments.map((assignment) => assignment.id_envio);

      // Query the paquete table to get package details
      const { data: packageData, error: packageError } = await supabase
        .from("paquete")
        .select("*")
        .in("id_envio", envioIds);

      if (packageError) {
        throw packageError;
      }

      // Combine the data to include dispatcher information
      const transformedData =
        packageData?.map((pkg) => {
          // Find the matching assignment to get dispatcher info
          const matchingAssignment = assignments.find(
            (a) => a.id_envio === pkg.id_envio
          );

          return {
            ...pkg,
            despachador_nombre:
              matchingAssignment?.despachador?.nombre || "Desconocido",
            despachador_id: matchingAssignment?.despachador?.id_despachador,
          };
        }) || [];

      return transformedData;
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  }

  /**
   * Sets up a subscription for assignment changes for a specific driver
   * @param driverId The ID of the driver
   * @param callback Function to call when changes are detected
   * @returns A subscription object that can be unsubscribed
   */
  static subscribeToAssignmentChanges(
    driverId: number,
    callback: () => void
  ): RealtimeChannel {
    const subscription = supabase
      .channel("asignacion-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asignacion",
          filter: `id_conductor=eq.${driverId}`,
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Updates the status of a package and all packages in the same envio if setting to "en tránsito"
   * @param packageId The ID of the package
   * @param newStatus The new status to set
   * @returns Promise that resolves when the update is complete
   */
  static async updatePackageStatus(
    packageId: number,
    newStatus: string
  ): Promise<void> {
    try {
      // First, get the package to find its envio ID
      const { data: packageData, error: packageError } = await supabase
        .from("paquete")
        .select("id_envio")
        .eq("id_paquete", packageId)
        .single();

      if (packageError) {
        throw packageError;
      }

      const envioId = packageData.id_envio;

      // If setting to "en tránsito", update all packages in the same envio
      if (newStatus.toLowerCase() === "en tránsito") {
        const { error: bulkUpdateError } = await supabase
          .from("paquete")
          .update({ estado: newStatus })
          .eq("id_envio", envioId);

        if (bulkUpdateError) {
          throw bulkUpdateError;
        }

        // Set this envio as the current one in transit
        EnvioStateService.setCurrentEnvioId(envioId.toString());
      } else {
        // For other statuses, only update the specific package
        const { error } = await supabase
          .from("paquete")
          .update({ estado: newStatus })
          .eq("id_paquete", packageId);

        if (error) {
          throw error;
        }

        // If this was the last package in transit for this envio, check if we should clear the current envio
        if (newStatus.toLowerCase() === "entregado") {
          await this.checkAndClearEnvioIfCompleted(envioId);
        }
      }
    } catch (error) {
      console.error("Error updating package status:", error);
      throw error;
    }
  }

  /**
   * Checks if all packages in an envio are delivered and clears the current envio if so
   * @param envioId The ID of the envio to check
   */
  private static async checkAndClearEnvioIfCompleted(
    envioId: number
  ): Promise<void> {
    try {
      const { data: packagesInTransit, error } = await supabase
        .from("paquete")
        .select("id_paquete")
        .eq("id_envio", envioId)
        .eq("estado", "en tránsito");

      if (error) {
        throw error;
      }

      // If no packages are in transit for this envio, clear it from the state
      if (!packagesInTransit || packagesInTransit.length === 0) {
        const currentEnvioId = EnvioStateService.getCurrentEnvioId();
        if (currentEnvioId === envioId.toString()) {
          EnvioStateService.clearCurrentEnvioId();
        }
      }
    } catch (error) {
      console.error("Error checking envio completion:", error);
    }
  }

  /**
   * Gets the current envio in transit
   * @returns The current envio ID in transit or null
   */
  static getCurrentEnvioInTransit(): string | null {
    return EnvioStateService.getCurrentEnvioId();
  }

  /**
   * Subscribes to changes in the current envio in transit
   * @param callback Function to call when the current envio changes
   * @returns Unsubscribe function
   */
  static subscribeToCurrentEnvioChanges(
    callback: (envioId: string | null) => void
  ): () => void {
    return EnvioStateService.subscribe(callback);
  }

  /**
   * Initializes the current envio in transit by checking for packages with "en tránsito" status
   * Should be called when the app starts or when a driver logs in
   * @param driverId The ID of the driver
   */
  static async initializeCurrentEnvioInTransit(
    driverId: number
  ): Promise<void> {
    try {
      // Get all assignments for this driver
      const { data: assignments, error: assignmentError } = await supabase
        .from("asignacion")
        .select("id_envio")
        .eq("id_conductor", driverId);

      if (assignmentError) {
        throw assignmentError;
      }

      if (!assignments || assignments.length === 0) {
        return;
      }

      // Get the list of shipment IDs assigned to this driver
      const envioIds = assignments.map((assignment) => assignment.id_envio);

      // Find any package that is currently "en tránsito"
      const { data: packagesInTransit, error: packageError } = await supabase
        .from("paquete")
        .select("id_envio")
        .in("id_envio", envioIds)
        .eq("estado", "en tránsito")
        .limit(1);

      if (packageError) {
        throw packageError;
      }

      // If there's a package in transit, set its envio as the current one
      if (packagesInTransit && packagesInTransit.length > 0) {
        EnvioStateService.setCurrentEnvioId(
          packagesInTransit[0].id_envio.toString()
        );
      }
    } catch (error) {
      console.error("Error initializing current envio in transit:", error);
    }
  }
}
