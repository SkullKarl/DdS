import { Platform } from 'react-native';

// Use dynamic imports to prevent bundling the wrong implementation
let Map;

if (Platform.OS === 'web') {
  // For web platform
  Map = require('./map.web').default;
} else {
  // For native platforms (iOS/Android)
  Map = require('./map.native').default;
}

export default Map;