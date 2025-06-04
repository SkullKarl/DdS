// HomeDriverScreen.tsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Map from '../../components/map/map';

export default function HomeDriverScreen() {
  return (
    <View style={styles.container}>
      <Map />
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