import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { supabase } from '../../api/supabaseConfig';

export default function HomeDispatcherScreen() {
  const [envios, setEnvios] = useState<any[]>([]);
  const [enviosSeleccionados, setEnviosSeleccionados] = useState<Set<string>>(new Set());
  const [conductores, setConductores] = useState<any[]>([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fase, setFase] = useState<'envio' | 'conductor'>('envio');

  useEffect(() => {
    const fetchEnvios = async () => {
      const { data, error } = await supabase
        .from('envio')
        .select('id_envio, paquetes_totales, id_ruta');

      if (error) {
        console.error('Error al obtener envíos:', error.message);
      } else {
        setEnvios(data ?? []);
      }

      setLoading(false);
    };

    fetchEnvios();
  }, []);

  const fetchConductores = async () => {
    const { data, error } = await supabase
      .from('conductor')
      .select('id, nombre, correo, telefono, estado');

    if (error) {
      console.error('Error al obtener conductores:', error.message);
    } else {
      setConductores(data ?? []);
      setFase('conductor');
    }
  };

  const toggleSeleccionEnvio = (id_envio: string) => {
    const nuevaSeleccion = new Set(enviosSeleccionados);
    if (nuevaSeleccion.has(id_envio)) {
      nuevaSeleccion.delete(id_envio);
    } else {
      nuevaSeleccion.add(id_envio);
    }
    setEnviosSeleccionados(nuevaSeleccion);
  };

  const renderEnvio = ({ item }: { item: any }) => {
    const seleccionado = enviosSeleccionados.has(item.id_envio);
    return (
      <TouchableOpacity
        style={[styles.item, seleccionado && styles.itemSeleccionado]}
        onPress={() => toggleSeleccionEnvio(item.id_envio)}
      >
        <Text>ID Envío: {item.id_envio}</Text>
        <Text>Paquetes: {item.paquetes_totales}</Text>
        <Text>Ruta: {item.id_ruta}</Text>
      </TouchableOpacity>
    );
  };

  const renderConductor = ({ item }: { item: any }) => {
    const seleccionado = conductorSeleccionado === item.id;
    return (
      <TouchableOpacity
        style={[styles.item, seleccionado && styles.itemSeleccionado]}
        onPress={() => setConductorSeleccionado(item.id)}
      >
        <Text>Nombre: {item.nombre}</Text>
        <Text>Correo: {item.correo}</Text>
        <Text>Teléfono: {item.telefono}</Text>
        <Text>Estado: {item.estado}</Text>
      </TouchableOpacity>
    );
  };

  const asignarEnvios = async () => {
    if (!conductorSeleccionado || enviosSeleccionados.size === 0) return;

    const updates = [...enviosSeleccionados].map((id_envio) => ({
      id_envio,
      id_conductor: conductorSeleccionado,
    }));

    const { error } = await supabase
      .from('envio')
      .upsert(updates, { onConflict: 'id_envio' });

    if (error) {
      console.error('Error al asignar envíos:', error.message);
      Alert.alert('Error', 'No se pudieron asignar los envíos.');
    } else {
      Alert.alert('Éxito', 'Los envíos fueron asignados correctamente.');
      setEnviosSeleccionados(new Set());
      setConductorSeleccionado(null);
      setFase('envio');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fase === 'envio' ? (
        <>
          <Text style={styles.titulo}>Selecciona los Envíos</Text>
          <FlatList
            data={envios}
            keyExtractor={(item) => item.id_envio}
            renderItem={renderEnvio}
          />
          <Button
            title="Continuar"
            onPress={fetchConductores}
            disabled={enviosSeleccionados.size === 0}
          />
        </>
      ) : (
        <>
          <Text style={styles.titulo}>Selecciona un Conductor</Text>
          <FlatList
            data={conductores}
            keyExtractor={(item) => item.id}
            renderItem={renderConductor}
          />
          <Button
            title="Asignar Envíos"
            onPress={asignarEnvios}
            disabled={!conductorSeleccionado}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
  },
  titulo: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginVertical: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemSeleccionado: {
    backgroundColor: '#cce5ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});