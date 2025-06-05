import { getDirections } from "../api/directionsApi";
import { supabase } from "../api/supabaseConfig";

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
};
