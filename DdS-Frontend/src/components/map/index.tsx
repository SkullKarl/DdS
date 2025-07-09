import { Platform } from 'react-native';

// Platform-specific exports
let Map;

if (Platform.OS === 'web') {
    // For web, directly export the web component without requiring native
    Map = require('./map.web').default;
} else {
    // For native platforms, load the native component
    Map = require('./map.native').default;
}

export default Map;