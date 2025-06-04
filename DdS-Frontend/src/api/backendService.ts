import { supabase } from '../api/supabaseConfig';

export const obtenerDireccionesDeEnvio = async (id_envio: string) => {
  const { data, error } = await supabase
    .from('paquete')
    .select('direccion_entrega')
    .eq('id_envio', id_envio);

  if (error) throw error;
  return data; // Array de objetos con { direccion_entrega }
};
