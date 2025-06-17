import { supabase } from "../api/supabaseConfig";
import { Package } from "../domain/Package";

export const RutaService = {
  async getDirections(idEnvio: string): Promise<string[]> {
    // obtener el id_ruta del envio
    const { data: envio, error: errorEnvio } = await supabase
      .from("envio")
      .select("id_ruta")
      .eq("id_envio", idEnvio)
      .single();

    if (errorEnvio) throw errorEnvio;
    if (!envio?.id_ruta) throw new Error("el envo no tiene una ruta asociada");

    // obtener puntos_referencia desde la ruta
    const { data: ruta, error: errorRuta } = await supabase
      .from("ruta")
      .select("puntos_referencia")
      .eq("id_ruta", envio.id_ruta)
      .single();

    if (errorRuta) throw errorRuta;
    if (!ruta?.puntos_referencia) throw new Error("La ruta no tiene puntos");

    return JSON.parse(ruta.puntos_referencia);
  },

  async createRutaForPackage(paquete: Package): Promise<string> {
    // Crea una nueva ruta con origen y destino del paquete
    const { data: newRuta, error } = await supabase
      .from("ruta")
      .insert({
        origen: null,
        puntos_referencia: JSON.stringify([paquete.direccion_entrega]),
      })
      .select("id_ruta")
      .single();

    if (error) throw error;
    return newRuta.id_ruta;
  },

  async addDestinoToRuta(id_ruta: string, destino: string): Promise<void> {
    // Obtiene los puntos actuales
    const { data: ruta, error } = await supabase
      .from("ruta")
      .select("puntos_referencia")
      .eq("id_ruta", id_ruta)
      .single();

    if (error) throw error;

    let puntos: string[] = [];
    if (ruta?.puntos_referencia) {
      puntos = JSON.parse(ruta.puntos_referencia);
    }
    // Agrega el destino si no está ya
    if (!puntos.includes(destino)) {
      puntos.push(destino);
      const { error: updateError } = await supabase
        .from("ruta")
        .update({ puntos_referencia: JSON.stringify(puntos) })
        .eq("id_ruta", id_ruta);
      if (updateError) throw updateError;
    }
  },
};
