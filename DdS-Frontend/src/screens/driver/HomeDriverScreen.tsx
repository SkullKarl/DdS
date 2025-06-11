import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapWeb from '../../components/map/map.web';

// Only load MapNative when not on web
const MapNative = Platform.OS !== 'web' 
  ? require('../../components/map/map.native').default 
  : null;

export default function HomeDriverScreen() {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' 
        ? <MapWeb envioId='0232e36f-d7de-4d88-9d99-c6bb30661f7b' />
        : <MapNative envioId='0232e36f-d7de-4d88-9d99-c6bb30661f7b' />
      }
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