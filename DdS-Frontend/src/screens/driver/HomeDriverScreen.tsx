import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Map from '../../components/map/map.native';

export default function HomeDriverScreen() {
  return (
    <View style={styles.container}>
      <Map envioId='0232e36f-d7de-4d88-9d99-c6bb30661f7b' /> 
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