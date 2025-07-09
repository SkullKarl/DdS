import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Map from '../../components/map';
import { ShipmentService } from '../../services/ShipmentService';

export default function HomeDriverScreen() {
  const [currentEnvioId, setCurrentEnvioId] = useState<string | null>(null);

  useEffect(() => {
    // Get the initial envio in transit
    const initialEnvioId = ShipmentService.getCurrentEnvioInTransit();
    setCurrentEnvioId(initialEnvioId);

    // Subscribe to changes in the current envio
    const unsubscribe = ShipmentService.subscribeToCurrentEnvioChanges((envioId) => {
      setCurrentEnvioId(envioId);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      {currentEnvioId ? (
        <Map envioId={currentEnvioId} />
      ) : (
        <View style={styles.noEnvioContainer}>
          <Text style={styles.noEnvioText}>
            No hay envíos en tránsito actualmente
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEnvioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEnvioText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});