import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Map from '../../components/map/map';

export default function HomeDriverScreen() {
  return (
    <View style={styles.container}>
      <Map envioId='21ae7624-9a3a-4791-8fa0-fce298d4e4af' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});