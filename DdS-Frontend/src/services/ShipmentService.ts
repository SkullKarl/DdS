// @ts-nocheck

import { supabase } from "../api/supabaseConfig";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Package } from "../domain/Package";
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
}
